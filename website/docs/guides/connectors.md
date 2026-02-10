---
sidebar_position: 4
---

# Database Connectors

FreshGuard Core supports six databases. All connectors extend `BaseConnector`, which provides built-in query validation, timeout protection, error sanitization, and structured logging.

## PostgreSQL

```typescript
import { PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});
```

Supports custom schemas:

```typescript
const connector = new PostgresConnector({
  // ...connection config
  schema: 'analytics',  // default: 'public'
});
```

## DuckDB

Embedded analytics database — no server required:

```typescript
import { DuckDBConnector } from '@freshguard/freshguard-core';

const connector = new DuckDBConnector({
  path: './analytics.duckdb',
});
```

Use `:memory:` for in-memory databases (useful for testing):

```typescript
const connector = new DuckDBConnector({ path: ':memory:' });
```

## BigQuery

```typescript
import { BigQueryConnector } from '@freshguard/freshguard-core';

const connector = new BigQueryConnector({
  host: 'bigquery.googleapis.com',
  database: 'my-gcp-project',
  password: process.env.BIGQUERY_SERVICE_ACCOUNT_JSON!,
  ssl: true,
});
```

Requires a GCP service account with BigQuery Data Viewer and BigQuery Job User roles.

## Snowflake

```typescript
import { SnowflakeConnector } from '@freshguard/freshguard-core';

const connector = new SnowflakeConnector({
  host: process.env.SNOWFLAKE_ACCOUNT!,
  database: 'ANALYTICS',
  username: process.env.SNOWFLAKE_USER!,
  password: process.env.SNOWFLAKE_PASSWORD!,
  ssl: true,
});
```

## MySQL

```typescript
import { MySQLConnector } from '@freshguard/freshguard-core';

const connector = new MySQLConnector({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});
```

## Redshift

```typescript
import { RedshiftConnector } from '@freshguard/freshguard-core';

const connector = new RedshiftConnector({
  host: process.env.REDSHIFT_HOST!,
  port: Number(process.env.REDSHIFT_PORT) || 5439,
  database: process.env.REDSHIFT_DB!,
  username: process.env.REDSHIFT_USER!,
  password: process.env.REDSHIFT_PASSWORD!,
  ssl: true,
});
```

## Connector interface

All connectors implement:

```typescript
interface Connector {
  testConnection(): Promise<boolean>;
  listTables(): Promise<string[]>;
  getTableSchema(tableName: string): Promise<TableSchema>;
  getRowCount(tableName: string): Promise<number>;
  getMaxTimestamp(tableName: string, columnName: string): Promise<Date | null>;
  getMinTimestamp(tableName: string, columnName: string): Promise<Date | null>;
  executeQuery(sql: string): Promise<QueryResultRow[]>;
  close(): Promise<void>;
}
```

## Security features

Every connector inherits from `BaseConnector`:

- **Query validation** — Blocks SQL injection patterns and dangerous operations
- **Timeout protection** — Configurable connection and query timeouts
- **Error sanitization** — Database error messages are scrubbed of credentials
- **Structured logging** — All operations logged via Pino with execution timing
- **Schema caching** — Table schemas cached to reduce repeated queries

## Best practices

- Use a **dedicated read-only database user** for FreshGuard
- **Enable SSL** in production (`ssl: true`)
- Store credentials in **environment variables**, not code
- Call `connector.close()` when done to release connections
