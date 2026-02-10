---
sidebar_position: 2
---

# Quick Start

Run a freshness check in under 5 minutes.

## 1. Connect to your database

```typescript
import { PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});
```

## 2. Define a monitoring rule

```typescript
import type { MonitoringRule } from '@freshguard/freshguard-core';

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
```

## 3. Run the check

```typescript
import { checkFreshness } from '@freshguard/freshguard-core';

const result = await checkFreshness(connector, rule);

if (result.status === 'alert') {
  console.log(`Data is ${result.lagMinutes}m stale!`);
} else {
  console.log(`Data is fresh (lag: ${result.lagMinutes}m)`);
}
```

## 4. Add volume monitoring (optional)

Volume anomaly detection requires metadata storage to track historical baselines:

```typescript
import { checkVolumeAnomaly, createMetadataStorage } from '@freshguard/freshguard-core';

const metadataStorage = await createMetadataStorage(); // DuckDB, zero-setup

const volumeRule: MonitoringRule = {
  id: 'orders-volume',
  sourceId: 'prod_db',
  name: 'Orders Volume',
  tableName: 'orders',
  ruleType: 'volume_anomaly',
  checkIntervalMinutes: 15,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkVolumeAnomaly(connector, volumeRule, metadataStorage);

if (result.status === 'alert') {
  console.log(`Volume anomaly: ${result.deviation}% deviation`);
}

await metadataStorage.close();
```

## 5. Add schema monitoring (optional)

```typescript
import { checkSchemaChanges } from '@freshguard/freshguard-core';

const schemaRule: MonitoringRule = {
  id: 'orders-schema',
  sourceId: 'prod_db',
  name: 'Orders Schema Monitor',
  tableName: 'orders',
  ruleType: 'schema_change',
  checkIntervalMinutes: 60,
  isActive: true,
  schemaChangeConfig: {
    adaptationMode: 'manual',
    monitoringMode: 'full',
    trackedColumns: { alertLevel: 'medium', trackTypes: true, trackNullability: false },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkSchemaChanges(connector, schemaRule, metadataStorage);

if (result.status === 'alert') {
  console.log(`Schema changes: ${result.schemaChanges?.summary}`);
}
```

## Next steps

- [Configuration reference](/docs/getting-started/configuration)
- [Freshness monitoring guide](/docs/guides/freshness-monitoring)
- [Database connectors](/docs/guides/connectors)
