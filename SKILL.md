# FreshGuard Core — Agent Skill

## When to use this library

Use `@freshguard/freshguard-core` when you need to **programmatically check whether data in a database table is fresh, whether row counts are normal, or whether the schema has changed**. It is the right tool when:

- A user asks you to monitor a data pipeline for staleness.
- A user wants alerts when a table stops updating or row counts look wrong.
- A user needs to detect schema drift (added/removed/modified columns).
- You need to connect to PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift, SQL Server, Azure SQL, or Azure Synapse and run read-only health checks.

Do **not** use this library for writing data, running arbitrary queries, or building dashboards.

---

## Installation

```bash
pnpm install @freshguard/freshguard-core
```

All imports come from the single entry point:

```typescript
import { checkFreshness, PostgresConnector, ... } from '@freshguard/freshguard-core';
```

---

## Core operations

### 1. Check data freshness

Detect when a table hasn't been updated within an expected window.

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';

// 1. Create a connector
const connector = new PostgresConnector({
  host: 'localhost', port: 5432,
  database: 'analytics',
  username: 'readonly',
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

// 2. Define a rule
const rule = {
  id: 'orders-freshness',
  sourceId: 'prod_pg',
  name: 'Orders Freshness',
  tableName: 'orders',
  ruleType: 'freshness' as const,
  toleranceMinutes: 60,          // alert if data is older than 60 min
  timestampColumn: 'updated_at', // column to check
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// 3. Run the check
const result = await checkFreshness(connector, rule);

// 4. Inspect the result
if (result.status === 'alert') {
  console.log(`Data is ${result.lagMinutes} minutes stale`);
}
// result.status is 'ok' | 'alert' | 'failed'
```

### 2. Detect volume anomalies

Alert when a table's row count deviates from its historical baseline.

```typescript
import { checkVolumeAnomaly, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ /* ... */ });

const rule = {
  id: 'orders-volume',
  sourceId: 'prod_pg',
  name: 'Orders Volume',
  tableName: 'orders',
  ruleType: 'volume_anomaly' as const,
  baselineWindowDays: 14,
  deviationThresholdPercent: 30, // alert if >30% deviation
  checkIntervalMinutes: 60,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Provide metadata storage so the baseline can be calculated from history
import { createMetadataStorage } from '@freshguard/freshguard-core';
const storage = await createMetadataStorage(); // embedded DuckDB

const result = await checkVolumeAnomaly(connector, rule, storage);

if (result.status === 'alert') {
  console.log(`Row count deviation: ${result.deviation}% from baseline ${result.baselineAverage}`);
}
```

### 3. Detect schema changes

Alert when columns are added, removed, or modified.

```typescript
import { checkSchemaChanges, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ /* ... */ });

const rule = {
  id: 'orders-schema',
  sourceId: 'prod_pg',
  name: 'Orders Schema',
  tableName: 'orders',
  ruleType: 'schema_change' as const,
  trackColumnChanges: true,
  checkIntervalMinutes: 60,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const storage = await createMetadataStorage();
const result = await checkSchemaChanges(connector, rule, storage);

if (result.status === 'alert' && result.schemaChanges) {
  console.log(result.schemaChanges.summary);
  // e.g. "2 columns added, 1 column removed"
}
```

---

## Connector setup

Every connector takes a `ConnectorConfig` object:

```typescript
interface ConnectorConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;          // default: true
  timeout?: number;       // connection timeout ms (default: 30000)
  queryTimeout?: number;  // query timeout ms (default: 10000)
  maxRows?: number;       // max rows returned (default: 1000)
  options?: Record<string, unknown>; // connector-specific options (see table below)
}
```

| Connector | Notes | `options` keys |
|---|---|---|
| `PostgresConnector` | Standard PostgreSQL | `schema` (default: `'public'`) |
| `DuckDBConnector` | `database` = file path or `':memory:'` | — |
| `BigQueryConnector` | `database` = GCP project ID | `location` (default: auto-detected, fallback `'US'`), `dataset` (scope `listTables()` to one dataset) |
| `SnowflakeConnector` | `host` = `<account>.snowflakecomputing.com` | `schema` (default: `'PUBLIC'`), `warehouse` |
| `MySQLConnector` | Standard MySQL, port 3306 | — |
| `RedshiftConnector` | PostgreSQL wire protocol, port 5439 | `schema` (default: `'public'`) |
| `MSSQLConnector` | SQL Server, port 1433 | `schema` (default: `'dbo'`) |
| `AzureSQLConnector` | `host` = `<server>.database.windows.net` | `schema` (default: `'dbo'`) |
| `SynapseConnector` | `host` = `<workspace>.sql.azuresynapse.net` | `schema` (default: `'dbo'`) |

**Important**: If your tables live in a non-default schema, you **must** pass `options.schema`
(or `options.location` for BigQuery). Without it, `listTables()` and `getTableSchema()` will
only see the default schema and may return empty results or errors.

```typescript
// Example: Snowflake with custom schema and warehouse
const sf = new SnowflakeConnector({
  host: 'xy12345.snowflakecomputing.com', port: 443,
  database: 'ANALYTICS', username: 'READER', password: '...',
  options: { schema: 'RAW_DATA', warehouse: 'COMPUTE_WH' },
});

// Example: BigQuery with EU location
const bq = new BigQueryConnector({
  host: 'bigquery.googleapis.com', port: 443,
  database: 'my-gcp-project', username: 'bigquery',
  password: serviceAccountJson,
  options: { location: 'EU' },
});

// Example: BigQuery scoped to a single dataset
const bqScoped = new BigQueryConnector({
  host: 'bigquery.googleapis.com', port: 443,
  database: 'my-gcp-project', username: 'bigquery',
  password: serviceAccountJson,
  options: { dataset: 'my_dataset' },
});

// Example: SQL Server with custom schema
const mssql = new MSSQLConnector({
  host: 'sql.example.com', port: 1433,
  database: 'analytics', username: 'readonly', password: '...',
  options: { schema: 'staging' },
});
```

---

## Metadata storage

Volume anomaly and schema change checks need historical data. Pass a
`MetadataStorage` instance as the third argument:

```typescript
import { createMetadataStorage } from '@freshguard/freshguard-core';

// Embedded DuckDB (zero-setup, default)
const storage = await createMetadataStorage();

// Custom DuckDB path
const storage = await createMetadataStorage({ type: 'duckdb', path: './meta.db' });

// PostgreSQL (shared across workers)
const storage = await createMetadataStorage({
  type: 'postgresql',
  url: 'postgresql://user:pass@host:5432/freshguard_meta',
});
```

---

## Error handling

All errors extend `FreshGuardError`. Catch specific subclasses:

```typescript
import {
  SecurityError,
  ConnectionError,
  TimeoutError,
  QueryError,
  ConfigurationError,
} from '@freshguard/freshguard-core';

try {
  const result = await checkFreshness(connector, rule);
} catch (err) {
  if (err instanceof ConnectionError) {
    // database unreachable
  } else if (err instanceof TimeoutError) {
    // query or connection timed out
  } else if (err instanceof SecurityError) {
    // blocked query (SQL injection prevention)
  }
}
```

---

## Key types

- **`MonitoringRule`** — defines what table to check, which algorithm, and the thresholds.
- **`CheckResult`** — the outcome: `status` (`'ok'` | `'alert'` | `'failed'`), plus `lagMinutes`, `deviation`, `schemaChanges`, etc.
- **`ConnectorConfig`** — database connection credentials.
- **`DataSource`** — a registered database with metadata.
- **`FreshGuardConfig`** — top-level config for self-hosted deployments.
