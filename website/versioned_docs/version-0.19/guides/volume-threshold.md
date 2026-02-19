---
sidebar_position: 3
---

# Volume Threshold Monitoring

Volume threshold monitoring alerts when a table's row count falls below a minimum or exceeds a maximum. Unlike [volume anomaly detection](/docs/guides/volume-anomaly), it uses static bounds and requires no historical baseline or metadata storage.

## How it works

1. `checkVolumeThreshold` queries `COUNT(*)` from your table
2. Compares the count against `minRowThreshold` and/or `maxRowThreshold`
3. Returns `status: 'alert'` if the count is outside the configured bounds

## Basic usage

```typescript
import {
  checkVolumeThreshold,
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

const rule: MonitoringRule = {
  id: 'orders-threshold',
  sourceId: 'prod_db',
  name: 'Orders Volume Threshold',
  tableName: 'orders',
  ruleType: 'volume_threshold',
  minRowThreshold: 100,        // alert if fewer than 100 rows
  maxRowThreshold: 10_000_000, // alert if more than 10M rows
  checkIntervalMinutes: 60,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkVolumeThreshold(connector, rule);

if (result.status === 'alert') {
  console.log(`Threshold breach: ${result.error}`);
}
```

## Result fields

| Field | Type | Description |
|---|---|---|
| `status` | `'ok' \| 'alert' \| 'failed'` | Check outcome |
| `rowCount` | `number \| undefined` | Current row count |
| `error` | `string \| undefined` | Threshold breach message or error details |

## Configuration

At least one threshold must be set. You can use either or both:

- **`minRowThreshold`** — Alert when row count drops below this value
- **`maxRowThreshold`** — Alert when row count exceeds this value

Both must be non-negative integers, and `minRowThreshold` cannot be greater than `maxRowThreshold`.

## Volume threshold vs. volume anomaly

| | Volume Threshold | Volume Anomaly |
|---|---|---|
| Detection method | Static min/max bounds | Historical baseline comparison |
| Metadata storage | Not required | Required |
| Baseline period | None | 3+ data points needed |
| Best for | Hard limits, simple alerting | Detecting drift from normal patterns |

## Use cases

- Ensuring a table always has data (min threshold > 0)
- Preventing runaway growth from duplicate inserts (max threshold)
- Simple monitoring where historical baselines are overkill
