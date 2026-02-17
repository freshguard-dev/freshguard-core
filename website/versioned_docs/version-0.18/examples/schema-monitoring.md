---
sidebar_position: 3
---

# Schema Change Monitoring

Track column additions, removals, and type changes with configurable adaptation modes.

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
    adaptationMode: 'manual',       // 'auto' | 'manual' | 'alert_only'
    monitoringMode: 'full',         // 'full' | 'partial'
    trackedColumns: {
      alertLevel: 'high',
      trackTypes: true,
      trackNullability: false,
    },
    baselineRefreshDays: 30,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkSchemaChanges(connector, rule, metadataStorage);

if (result.status === 'alert' && result.schemaChanges) {
  console.log(`Schema changes detected: ${result.schemaChanges.summary}`);
  console.log(`Severity: ${result.schemaChanges.severity}`);
  console.log(`Total changes: ${result.schemaChanges.changeCount}`);

  for (const col of result.schemaChanges.addedColumns ?? []) {
    console.log(`  + ${col.columnName}`);
  }
  for (const col of result.schemaChanges.removedColumns ?? []) {
    console.log(`  - ${col.columnName}`);
  }
  for (const col of result.schemaChanges.modifiedColumns ?? []) {
    console.log(`  ~ ${col.columnName}: ${col.oldValue} -> ${col.newValue}`);
  }
} else {
  console.log('Schema is stable');
}

await metadataStorage.close();
await connector.close();
```
