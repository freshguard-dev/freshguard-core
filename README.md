# FreshGuard Core

**Open source data pipeline freshness monitoring engine.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@freshguard/freshguard-core.svg)](https://www.npmjs.com/package/@freshguard/freshguard-core)
[![Docs](https://img.shields.io/badge/docs-website-blue)](https://freshguard-dev.github.io/freshguard-core)

Monitor when your data pipelines go stale. Supports PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift, SQL Server, Azure SQL, and Azure Synapse. Self-hosted. Free forever.

**When to use this:** You run data pipelines (ETL/ELT) that land data into a warehouse or database and you need to know — programmatically — when a table stops updating, row counts look wrong, or the schema drifts. Install this package in a Node.js script, a cron job, or a long-running process and it will check your tables and tell you what's stale. No dashboard, no vendor lock-in, no account required.

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

## API at a glance

### Monitoring functions

| Export | Description |
|---|---|
| `checkFreshness(connector, rule)` | Returns `'alert'` when `MAX(timestampColumn)` exceeds `toleranceMinutes` |
| `checkVolumeAnomaly(connector, rule)` | Returns `'alert'` when current row count deviates from the historical baseline |
| `checkSchemaChanges(connector, rule)` | Returns `'alert'` when columns are added, removed, or modified |

### Connectors

| Export | Database |
|---|---|
| `PostgresConnector` | PostgreSQL |
| `DuckDBConnector` | DuckDB (local file / `:memory:`) |
| `BigQueryConnector` | Google BigQuery |
| `SnowflakeConnector` | Snowflake |
| `MySQLConnector` | MySQL |
| `RedshiftConnector` | Amazon Redshift |
| `MSSQLConnector` | SQL Server |
| `AzureSQLConnector` | Azure SQL Database |
| `SynapseConnector` | Azure Synapse Analytics |

All connectors accept a `ConnectorConfig` (host, port, database, username, password, ssl) and an optional `SecurityConfig` override. Pass connector-specific settings via `options` — e.g., `options: { schema: 'staging' }` for non-default schemas, `options: { location: 'EU' }` for BigQuery region, `options: { dataset: 'my_dataset' }` to scope BigQuery to a single dataset, or `options: { warehouse: 'COMPUTE_WH' }` for Snowflake.

### Metadata storage

| Export | Description |
|---|---|
| `createMetadataStorage(config?)` | Factory — returns DuckDB (default) or PostgreSQL metadata store |
| `DuckDBMetadataStorage` | Embedded DuckDB storage (zero-setup) |
| `PostgreSQLMetadataStorage` | PostgreSQL-backed shared storage |

### Database utilities

| Export | Description |
|---|---|
| `createDatabase(connectionString)` | Create a Drizzle ORM connection to the FreshGuard PostgreSQL schema |
| `schema` | Drizzle table definitions |

### Error classes

| Export | Thrown when |
|---|---|
| `FreshGuardError` | Base class for all FreshGuard errors |
| `SecurityError` | SQL injection attempt or blocked query |
| `ConnectionError` | Database connection failure |
| `TimeoutError` | Query or connection timeout exceeded |
| `QueryError` | Query execution failure |
| `ConfigurationError` | Invalid configuration |
| `MonitoringError` | Monitoring logic failure |

### Key types

`MonitoringRule`, `CheckResult`, `DataSource`, `SourceCredentials`, `ConnectorConfig`, `CheckStatus`, `RuleType`, `DataSourceType`, `SchemaChanges`, `ColumnChange`, `FreshGuardConfig`

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

## Compatibility

| Requirement | Version |
|---|---|
| Node.js | >=20.0.0 |
| TypeScript | >=5.3 (ships `.d.ts` + declaration maps) |
| Module system | ESM only (`"type": "module"`) |
| Package manager | pnpm >=10 (npm/yarn work for consumers) |

This package follows **semver**. Breaking changes only land in major version bumps. The current version is **0.x** (pre-1.0), so minor versions may contain breaking changes — check [CHANGELOG.md](CHANGELOG.md) before upgrading.

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
