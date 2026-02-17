---
sidebar_position: 3
---

# Schema Change Monitoring

Schema change monitoring detects when table columns are added, removed, or modified. It stores a baseline snapshot and compares it on each check.

## How it works

1. `checkSchemaChanges` queries the current table schema via the connector
2. Retrieves the stored baseline from metadata storage
3. If no baseline exists, stores the current schema as the baseline and returns `ok`
4. Compares current vs. baseline: added columns, removed columns, type changes
5. If changes are detected, returns `alert` with detailed change information

## Requirements

Schema change monitoring **requires metadata storage** to persist baselines.

## Basic usage

```typescript
import {
  checkSchemaChanges,
  createMetadataStorage,
  PostgresConnector,
} from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const metadataStorage = await createMetadataStorage();

const rule: MonitoringRule = {
  id: 'users-schema',
  sourceId: 'prod_db',
  name: 'Users Table Schema',
  tableName: 'users',
  ruleType: 'schema_change',
  checkIntervalMinutes: 60,
  isActive: true,
  schemaChangeConfig: {
    adaptationMode: 'manual',
    monitoringMode: 'full',
    trackedColumns: {
      alertLevel: 'medium',
      trackTypes: true,
      trackNullability: false,
    },
    baselineRefreshDays: 30,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkSchemaChanges(connector, rule, metadataStorage);

if (result.status === 'alert') {
  console.log(`Changes detected: ${result.schemaChanges?.summary}`);

  for (const col of result.schemaChanges?.addedColumns ?? []) {
    console.log(`+ Added: ${col.columnName}`);
  }
  for (const col of result.schemaChanges?.removedColumns ?? []) {
    console.log(`- Removed: ${col.columnName}`);
  }
  for (const col of result.schemaChanges?.modifiedColumns ?? []) {
    console.log(`~ Modified: ${col.columnName} (${col.changeType}): ${col.oldValue} -> ${col.newValue}`);
  }
}

await metadataStorage.close();
```

## Adaptation modes

Control how detected changes are handled:

| Mode | Behavior |
|---|---|
| `manual` | Always alert. Baseline is never auto-updated. You must manually re-baseline. |
| `auto` | Safe changes (column additions, compatible type widening) auto-update the baseline. Breaking changes still alert. |
| `alert_only` | Always alert on any change. Baseline is never updated. |

**Recommendation:** Use `manual` for production tables where schema changes should be reviewed.

## Monitoring modes

| Mode | Behavior |
|---|---|
| `full` | Monitor all columns in the table (default) |
| `partial` | Monitor only columns specified in `trackedColumns.columns` |

## Severity levels

Changes are assigned a severity:

- **high** — Column removals, type narrowing (breaking changes)
- **medium** — Type changes, nullability changes
- **low** — Column additions

## Result fields

The `schemaChanges` field on `CheckResult` includes:

| Field | Type | Description |
|---|---|---|
| `hasChanges` | `boolean` | Whether changes were detected |
| `addedColumns` | `ColumnChange[]` | Newly added columns |
| `removedColumns` | `ColumnChange[]` | Removed columns |
| `modifiedColumns` | `ColumnChange[]` | Columns with type or constraint changes |
| `summary` | `string` | Human-readable change summary |
| `changeCount` | `number` | Total number of changes |
| `severity` | `'low' \| 'medium' \| 'high'` | Highest severity among changes |
