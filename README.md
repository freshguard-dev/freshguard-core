# FreshGuard Core

**Open source data pipeline freshness monitoring engine.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@freshguard/freshguard-core.svg)](https://www.npmjs.com/package/@freshguard/freshguard-core)
[![Docs](https://img.shields.io/badge/docs-website-blue)](https://freshguard-dev.github.io/freshguard-core)

Monitor when your data pipelines go stale. Supports PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift, SQL Server, Azure SQL, and Azure Synapse. Self-hosted. Free forever.

## Install

```bash
pnpm install @freshguard/freshguard-core
```

## Quick example

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const result = await checkFreshness(connector, {
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
});

if (result.status === 'alert') {
  console.log(`Data is ${result.lagMinutes}m stale!`);
}
```

## What it does

- **Freshness monitoring** — Alert when a table hasn't been updated within a tolerance window
- **Volume anomaly detection** — Alert when row counts deviate from a calculated baseline
- **Schema change detection** — Alert when columns are added, removed, or modified

## Documentation

**[Read the full docs](https://freshguard-dev.github.io/freshguard-core)** — guides, API reference, examples, and self-hosting instructions.

| Section | Description |
|---|---|
| [Getting Started](https://freshguard-dev.github.io/freshguard-core/docs/getting-started/installation) | Install, quick start, configuration |
| [Guides](https://freshguard-dev.github.io/freshguard-core/docs/guides/freshness-monitoring) | Freshness, volume, schema, connectors, metadata, errors, CLI |
| [API Reference](https://freshguard-dev.github.io/freshguard-core/docs/api) | Auto-generated from TypeScript source |
| [Examples](https://freshguard-dev.github.io/freshguard-core/docs/examples/basic-freshness) | Basic checks, multi-database, alerting, Docker |
| [Security](https://freshguard-dev.github.io/freshguard-core/docs/security/overview) | Security features and self-hosting checklist |
| [Contributing](https://freshguard-dev.github.io/freshguard-core/docs/contributing/development-setup) | Dev setup, adding connectors, adding monitors, testing |

## Database support

| Database | Connector | Since |
|---|---|---|
| PostgreSQL | `PostgresConnector` | 0.1.0 |
| DuckDB | `DuckDBConnector` | 0.1.0 |
| BigQuery | `BigQueryConnector` | 0.2.0 |
| Snowflake | `SnowflakeConnector` | 0.2.0 |
| MySQL | `MySQLConnector` | 0.11.0 |
| Redshift | `RedshiftConnector` | 0.11.0 |
| SQL Server | `MSSQLConnector` | 0.14.0 |
| Azure SQL Database | `AzureSQLConnector` | 0.14.0 |
| Azure Synapse Analytics | `SynapseConnector` | 0.14.0 |

## CLI

```bash
export FRESHGUARD_DATABASE_URL="postgresql://user:password@localhost:5432/db"
pnpm exec freshguard init
pnpm exec freshguard test
pnpm exec freshguard run
```

## Architecture

This is the **open-source core** (MIT licensed). It contains all monitoring logic, connectors, and CLI tooling. It does not include multi-tenant features, authentication, or dashboards — those are part of [FreshGuard Cloud](https://freshguard.dev).

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full technical breakdown.

## Contributing

See the [Contributing guide](https://freshguard-dev.github.io/freshguard-core/docs/contributing/development-setup) or [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

```bash
pnpm install && pnpm build && pnpm test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — See [LICENSE](./LICENSE)
