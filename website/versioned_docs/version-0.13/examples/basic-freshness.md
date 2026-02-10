---
sidebar_position: 1
---

# Basic Freshness Check

A minimal example that checks whether a PostgreSQL table's data is fresh.

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
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

if (result.status === 'alert') {
  console.log(`Data is ${result.lagMinutes}m stale!`);
} else {
  console.log(`Data is fresh (lag: ${result.lagMinutes}m)`);
}

await connector.close();
```

A runnable version with Docker Compose is in [`examples/basic-freshness-check/`](https://github.com/freshguard-dev/freshguard-core/tree/main/examples/basic-freshness-check).
