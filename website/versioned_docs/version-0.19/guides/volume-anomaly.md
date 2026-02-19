---
sidebar_position: 2
---

# Volume Anomaly Detection

Volume anomaly detection catches unexpected changes in table row counts by comparing the current count against a historical baseline.

## How it works

1. `checkVolumeAnomaly` queries `COUNT(*)` from your table
2. Retrieves historical row counts from metadata storage
3. Calculates a baseline average from recent executions
4. Computes deviation: `|current - baseline| / baseline`
5. If deviation exceeds the threshold, returns `status: 'alert'`

## Requirements

Volume anomaly detection **requires metadata storage** to persist historical data. The first few executions build the baseline — you need at least 3 data points before anomaly detection activates.

## Basic usage

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

if (result.status === 'alert') {
  console.log(`Volume anomaly: ${result.deviation}% deviation from baseline`);
}

await metadataStorage.close();
```

## Result fields

| Field | Type | Description |
|---|---|---|
| `status` | `'ok' \| 'alert' \| 'failed' \| 'pending'` | Check outcome (`pending` during baseline building) |
| `rowCount` | `number \| undefined` | Current row count |
| `deviation` | `number \| undefined` | Percentage deviation from baseline |
| `error` | `string \| undefined` | Error message if status is `failed` |

## Baseline behavior

- Historical data is stored automatically after each check execution
- The baseline window is configurable (default: last 7 days)
- A minimum of 3 historical data points is required before anomaly detection triggers
- Execution history is automatically pruned (last 1000 executions per rule)

## Simple alternative: volume thresholds

If you don't need historical baseline comparison and just want to alert when a table's row count is outside a fixed range, use [`checkVolumeThreshold`](/docs/guides/volume-threshold) instead. It requires no metadata storage and no baseline building period.

## Use cases

- Detecting pipeline failures that result in zero or partial loads
- Catching accidental deletes or truncations
- Identifying unexpected data growth from duplicate inserts
