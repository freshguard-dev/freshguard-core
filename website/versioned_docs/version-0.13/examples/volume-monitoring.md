---
sidebar_position: 2
---

# Volume Monitoring

Detect unexpected row count changes by comparing against a historical baseline.

```typescript
import {
  checkVolumeAnomaly,
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

// Metadata storage is required for volume anomaly detection
const metadataStorage = await createMetadataStorage();

const rule: MonitoringRule = {
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

const result = await checkVolumeAnomaly(connector, rule, metadataStorage);

switch (result.status) {
  case 'ok':
    console.log(`Row count normal: ${result.rowCount}`);
    break;
  case 'alert':
    console.log(`Volume anomaly: ${result.deviation}% deviation (${result.rowCount} rows)`);
    break;
  case 'pending':
    console.log('Building baseline — need more data points');
    break;
  case 'failed':
    console.error(`Check failed: ${result.error}`);
    break;
}

await metadataStorage.close();
await connector.close();
```

**Note:** The first few executions return `pending` while the baseline builds. You need at least 3 data points.
