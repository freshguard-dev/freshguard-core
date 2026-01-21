# FreshGuard Core

**Open source data pipeline freshness monitoring engine.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@freshguard%2Fcore.svg)](https://www.npmjs.com/package/@thias-se/freshguard-core)

## What is FreshGuard Core?

Monitor when your data pipelines go stale. Get alerts when:
- **Data hasn't updated in X minutes** (freshness checks)
- **Row counts deviate unexpectedly** (volume anomaly detection)

Supports PostgreSQL and DuckDB. Self-hosted. Free forever.

## Quick Start

### 1. Install

```bash
pnpm install @thias-se/freshguard-core
```

### 2. Check Freshness

```typescript
import { checkFreshness, createDatabase } from '@thias-se/freshguard-core';
import type { MonitoringRule } from '@thias-se/freshguard-core';

const db = createDatabase('postgresql://user:pass@localhost:5432/mydb');

const rule: MonitoringRule = {
  id: 'orders-freshness',
  workspaceId: 'self-hosted',
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

const result = await checkFreshness(db, rule);

if (result.status === 'alert') {
  console.log(`⚠️ Data is ${result.lagMinutes}m stale!`);
} else {
  console.log(`✅ Data is fresh (lag: ${result.lagMinutes}m)`);
}
```

### 3. Check Volume Anomalies

```typescript
import { checkVolumeAnomaly, createDatabase } from '@thias-se/freshguard-core';

const db = createDatabase('postgresql://user:pass@localhost:5432/mydb');

const result = await checkVolumeAnomaly(db, rule);

if (result.status === 'alert') {
  console.log(`⚠️ Volume anomaly detected: ${result.deviation}% deviation from baseline`);
}
```

## Features

✅ **Freshness Monitoring** - Detect stale data based on last update time
✅ **Volume Anomaly Detection** - Identify unexpected row count changes
✅ **PostgreSQL Support** - Native PostgreSQL connector
✅ **DuckDB Support** - Coming soon
✅ **Type-Safe** - Written in TypeScript with full type definitions
✅ **Self-Hosted** - Run on your own infrastructure
✅ **MIT Licensed** - Free to use, modify, and distribute

## CLI Usage

FreshGuard Core includes a simple CLI for self-hosters:

```bash
# Initialize monitoring
pnpm exec freshguard init postgres://user:pass@localhost/mydb

# Test connection
pnpm exec freshguard test --source prod_db

# Run scheduler
pnpm exec freshguard run --config ./freshguard.yaml
```

**Note:** CLI features are coming soon. For now, use the programmatic API.

## Self-Hosting

See the [Self-Hosting Guide](docs/SELF_HOSTING.md) for:
- Docker deployment
- Kubernetes setup
- Configuration examples
- Custom alerting

## What's Not Included

This is the **open source core**. It does not include:
- Multi-user dashboard (use config files instead)
- Managed hosting (you manage uptime)
- Priority support (community support via GitHub)
- Advanced features (data lineage, ML anomalies)

Want these features? Check out **[FreshGuard Cloud](https://freshguard.dev)** - our managed SaaS.

## Architecture

FreshGuard uses an **Open Core** model:

- **`@thias-se/freshguard-core`** (this package) - MIT licensed, open source monitoring engine
- **`freshguard-cloud`** - Proprietary multi-tenant SaaS (optional)

You can self-host the core or use our managed cloud service.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Examples

### Custom Alerting

```typescript
import { checkFreshness, createDatabase } from '@thias-se/freshguard-core';
import { sendSlackAlert } from './alerts.js';

const db = createDatabase(process.env.DATABASE_URL!);
const result = await checkFreshness(db, rule);

if (result.status === 'alert') {
  await sendSlackAlert({
    channel: '#data-alerts',
    message: `⚠️ ${rule.name} is stale (${result.lagMinutes}m lag)`,
  });
}
```

### Scheduled Checks

```typescript
import { checkFreshness, createDatabase } from '@thias-se/freshguard-core';
import cron from 'node-cron';

const db = createDatabase(process.env.DATABASE_URL!);

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const result = await checkFreshness(db, rule);
  console.log(`Check result: ${result.status}`);
});
```

## API Documentation

### `checkFreshness(db, rule)`

Check data freshness for a given rule.

**Parameters:**
- `db` - Database connection (from `createDatabase`)
- `rule` - Monitoring rule configuration

**Returns:** `Promise<CheckResult>`

### `checkVolumeAnomaly(db, rule)`

Check for volume anomalies in a table.

**Parameters:**
- `db` - Database connection (from `createDatabase`)
- `rule` - Monitoring rule configuration

**Returns:** `Promise<CheckResult>`

### `createDatabase(connectionString)`

Create a database connection.

**Parameters:**
- `connectionString` - PostgreSQL connection string

**Returns:** `Database` instance

## License

MIT - See [LICENSE](./LICENSE)

## Support

- **Documentation:** [GitHub Wiki](https://github.com/freshguard/freshguard/wiki)
- **Issues:** [GitHub Issues](https://github.com/freshguard/freshguard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/freshguard/freshguard/discussions)

## Need Managed Hosting?

Self-hosting requires ops. Want a managed experience?

**[Try FreshGuard Cloud (COMING SOON)](https://freshguard.dev)**

---

Built with ❤️ by the FreshGuard community