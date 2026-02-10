---
sidebar_position: 1
---

# Installation

## Requirements

- Node.js 20+
- pnpm, npm, or yarn

## Install

```bash
pnpm install @freshguard/freshguard-core
```

Or with npm:

```bash
npm install @freshguard/freshguard-core
```

## Verify

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';

console.log('FreshGuard Core installed successfully');
```

## What's included

The package exports:

| Category | Exports |
|---|---|
| **Monitoring** | `checkFreshness`, `checkVolumeAnomaly`, `checkSchemaChanges` |
| **Connectors** | `PostgresConnector`, `DuckDBConnector`, `BigQueryConnector`, `SnowflakeConnector`, `MySQLConnector`, `RedshiftConnector` |
| **Metadata** | `createMetadataStorage`, `DuckDBMetadataStorage`, `PostgreSQLMetadataStorage` |
| **Errors** | `SecurityError`, `ConnectionError`, `TimeoutError`, `QueryError`, `ConfigurationError`, `MonitoringError` |
| **Types** | `MonitoringRule`, `CheckResult`, `DataSource`, `FreshGuardConfig`, and more |

## CLI

The package includes a `freshguard` CLI binary:

```bash
pnpm exec freshguard --help
```

## Next steps

- [Quick Start — run your first check](/docs/getting-started/quick-start)
- [Configuration reference](/docs/getting-started/configuration)
