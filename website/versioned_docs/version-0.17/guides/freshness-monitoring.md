---
sidebar_position: 1
---

# Freshness Monitoring

Freshness monitoring detects stale data by querying the most recent timestamp in a table and comparing it to a tolerance window.

## How it works

1. `checkFreshness` queries `MAX(timestampColumn)` from your table
2. Calculates lag: `now - maxTimestamp`
3. If lag exceeds `toleranceMinutes`, returns `status: 'alert'`
4. Otherwise returns `status: 'ok'`

## Basic usage

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const rule: MonitoringRule = {
  id: 'orders-freshness',
  sourceId: 'prod_db',
  name: 'Orders Freshness',
  tableName: 'orders',
  ruleType: 'freshness',
  toleranceMinutes: 60,
  timestampColumn: 'updated_at',
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkFreshness(connector, rule);
console.log(result.status);     // 'ok' | 'alert' | 'failed'
console.log(result.lagMinutes); // e.g. 42
```

## Choosing `toleranceMinutes`

Set this based on your pipeline's expected update frequency:

| Pipeline cadence | Suggested tolerance |
|---|---|
| Real-time / streaming | 5–15 minutes |
| Hourly batch | 90–120 minutes |
| Daily batch | 1500–1600 minutes (25–26 hours) |

Leave some headroom above the expected cadence to avoid false positives from normal variance.

## Choosing `timestampColumn`

Use the column that best represents when a row was last written or updated:

- `updated_at` — best if your pipeline updates rows in place
- `created_at` — best for append-only tables
- `_etl_loaded_at` — if your ETL tool adds a load timestamp

The column must be a timestamp or datetime type.

## Result fields

The `CheckResult` returned by `checkFreshness` includes:

| Field | Type | Description |
|---|---|---|
| `status` | `'ok' \| 'alert' \| 'failed'` | Check outcome |
| `lagMinutes` | `number \| undefined` | Minutes since the most recent row |
| `rowCount` | `number \| undefined` | Current row count (if available) |
| `error` | `string \| undefined` | Error message if status is `failed` |

## Scheduling checks

Use any scheduler (cron, `node-cron`, systemd timer, Kubernetes CronJob):

```typescript
import cron from 'node-cron';

cron.schedule('*/5 * * * *', async () => {
  const result = await checkFreshness(connector, rule);
  if (result.status === 'alert') {
    // send notification
  }
});
```

## With metadata storage

Passing metadata storage is optional for freshness checks but enables execution history tracking:

```typescript
import { createMetadataStorage } from '@freshguard/freshguard-core';

const metadataStorage = await createMetadataStorage();
const result = await checkFreshness(connector, rule, metadataStorage);
await metadataStorage.close();
```
