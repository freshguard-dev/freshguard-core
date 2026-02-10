# Architecture

This document describes the high-level architecture of FreshGuard Core, how the components relate, and how to extend the system.

## Overview

FreshGuard Core is a layered monitoring engine. Data flows from user configuration through monitoring algorithms, into database connectors, and back out as check results.

```
┌─────────────────────────────────────────────────┐
│              CLI / Direct API Call               │
│          (freshguard command or imports)         │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Monitoring Algorithms                 │
│                                                  │
│  checkFreshness   checkVolumeAnomaly             │
│  checkSchemaChanges                              │
│                                                  │
│  Each function: validate → query → analyze →     │
│  return CheckResult                              │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Database Connectors                   │
│                                                  │
│  BaseConnector (abstract)                        │
│  ├── PostgresConnector                           │
│  ├── DuckDBConnector                             │
│  ├── BigQueryConnector                           │
│  ├── SnowflakeConnector                          │
│  ├── MySQLConnector                              │
│  └── RedshiftConnector                           │
│                                                  │
│  Built-in: query validation, timeout protection, │
│  error sanitization, structured logging          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            Metadata Storage                      │
│                                                  │
│  MetadataStorage interface                       │
│  ├── DuckDBMetadataStorage  (zero-setup)         │
│  └── PostgreSQLMetadataStorage (production)      │
│                                                  │
│  Stores: execution history, volume baselines,    │
│  schema baselines, monitoring rules              │
└─────────────────────────────────────────────────┘
```

## Component Details

### Monitoring Algorithms (`src/monitor/`)

Three monitoring types, each following the same pattern:

1. **Freshness** (`freshness.ts`) — Queries the max timestamp of a column and compares it against `toleranceMinutes`. Returns `alert` if data is stale.

2. **Volume Anomaly** (`volume.ts`) — Queries the current row count, compares it to a historical baseline (from metadata storage), and checks if the deviation exceeds `deviationThreshold`. Uses a configurable baseline window.

3. **Schema Changes** (`schema-changes.ts`) — Queries the current table schema, compares it to a stored baseline, and reports added/removed/modified columns. Three adaptation modes control whether baselines auto-update:
   - `auto` — Safe changes (column additions) update the baseline automatically
   - `manual` — All changes require explicit approval
   - `alert_only` — Alert on every change, never update baseline

All monitoring functions accept:
- A `Connector` (database driver)
- A `MonitoringRule` (configuration)
- An optional `MetadataStorage` (for baselines and history)
- An optional `FreshGuardConfig` (for debug mode, timeouts)

All return a `CheckResult` with `status`, metric data, and optionally debug info.

### Database Connectors (`src/connectors/`)

Every connector extends `BaseConnector`, which provides:

- **Query validation** — Pattern matching and blocked keyword detection before execution
- **Timeout protection** — Configurable query and connection timeouts
- **Error sanitization** — Database errors are mapped to safe messages (no credential leakage)
- **Structured logging** — Every query is logged with execution time via Pino
- **Schema caching** — Table schemas are cached to reduce repeated queries

Concrete connectors implement the abstract methods:

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

### Metadata Storage (`src/metadata/`)

Abstracts persistence of monitoring state. The `MetadataStorage` interface defines:

- `saveExecution()` / `getHistoricalData()` — Execution history for volume baselines
- `storeSchemaBaseline()` / `getSchemaBaseline()` — Schema snapshots for change detection
- `saveRule()` / `getRule()` — Monitoring rule persistence
- `initialize()` / `close()` — Lifecycle management

Two built-in backends:
- **DuckDB** — Single-file embedded database, zero setup, ideal for self-hosting and Docker
- **PostgreSQL** — Full ACID, concurrent access, recommended for production

The `createMetadataStorage()` factory creates the appropriate backend from config.

### Error Handling (`src/errors/`)

A typed error hierarchy for precise catch handling:

```
FreshGuardError (base)
├── SecurityError        — SQL injection, blocked queries
├── ConnectionError      — Network, authentication failures
├── TimeoutError         — Query/connection timeouts
├── QueryError           — Bad SQL, missing tables
├── ConfigurationError   — Invalid config values
├── MonitoringError      — Check execution failures
└── MetadataStorageError — Storage operation failures
```

All errors include:
- `code` — Machine-readable error code (e.g. `SECURITY_VIOLATION`)
- `timestamp` — When the error occurred
- `sanitized` — Whether the message is safe for end-user display
- `toJSON()` — Serialization for structured logging

### Cross-Cutting Concerns

**Security** (`src/security/`) — Query complexity analysis, risk scoring, schema caching for validation.

**Validation** (`src/validation/`) — Zod-based runtime validation of configuration and inputs. Sanitizers for identifiers and parameters.

**Resilience** (`src/resilience/`) — Circuit breakers for database connections, exponential backoff retry policies, timeout management with `AbortController`.

**Observability** (`src/observability/`) — Pino-based structured JSON logging with sensitive data redaction. Metrics collection per component.

## Data Flow Examples

### Freshness Check

```
checkFreshness(connector, rule)
  → validate rule (ruleType, toleranceMinutes, timestampColumn)
  → connector.getMaxTimestamp(rule.tableName, rule.timestampColumn)
    → BaseConnector validates query
    → Execute against database with timeout
    → Return Date or null
  → Calculate lag = now - maxTimestamp
  → If lag > toleranceMinutes → status: 'alert'
  → Else → status: 'ok'
  → Return CheckResult { status, lagMinutes, rowCount }
```

### Volume Anomaly Check

```
checkVolumeAnomaly(connector, rule, metadataStorage)
  → validate rule (ruleType, deviationThreshold)
  → connector.getRowCount(rule.tableName)
  → metadataStorage.getHistoricalData(rule.id, baselineWindowDays)
  → Calculate baseline from historical row counts
  → Calculate deviation = |current - baseline| / baseline
  → If deviation > threshold → status: 'alert'
  → Save current execution to metadata storage
  → Return CheckResult { status, rowCount, deviation }
```

### Schema Change Check

```
checkSchemaChanges(connector, rule, metadataStorage)
  → validate rule (ruleType, schemaChangeConfig)
  → connector.getTableSchema(rule.tableName)
  → metadataStorage.getSchemaBaseline(rule.id)
  → If no baseline exists → store current as baseline → status: 'ok'
  → Compare current schema vs baseline
    → Detect added columns, removed columns, type changes
  → If changes detected:
    → Evaluate severity (high for removals, medium for type changes, low for additions)
    → If adaptationMode is 'auto' and changes are safe → update baseline
    → Return status: 'alert' with schemaChanges details
  → Else → status: 'ok'
```

## Extension Guide

### Adding a New Database Connector

1. Create `src/connectors/mydb.ts`
2. Extend `BaseConnector`:
   ```typescript
   import { BaseConnector } from './base-connector.js';

   export class MyDBConnector extends BaseConnector {
     // Implement all abstract methods:
     // testConnection, listTables, getTableSchema,
     // getRowCount, getMaxTimestamp, getMinTimestamp,
     // executeQuery, close
   }
   ```
3. Export in `src/connectors/index.ts`
4. Re-export in `src/index.ts`
5. Add tests in `tests/connectors/`

### Adding a New Monitoring Algorithm

1. Create `src/monitor/mycheck.ts`
2. Export a function matching the pattern:
   ```typescript
   export async function checkMyThing(
     connector: Connector,
     rule: MonitoringRule,
     metadataStorage?: MetadataStorage,
     config?: FreshGuardConfig,
   ): Promise<CheckResult> { }
   ```
3. Export in `src/monitor/index.ts`
4. Re-export in `src/index.ts`
5. Add tests in `tests/monitor/`

### Adding a Custom Metadata Storage Backend

1. Implement the `MetadataStorage` interface
2. Register in `src/metadata/factory.ts` or use directly

## Dependency Rationale

| Dependency | Purpose |
|---|---|
| `pg` / `postgres` | PostgreSQL connectivity |
| `@duckdb/node-api` | Embedded analytics database |
| `@google-cloud/bigquery` | BigQuery connectivity |
| `snowflake-sdk` | Snowflake connectivity |
| `mysql2` | MySQL/MariaDB connectivity |
| `drizzle-orm` | Type-safe database schema and migrations |
| `zod` | Runtime validation of configuration and inputs |
| `pino` | Structured JSON logging |

All dependencies are MIT or Apache 2.0 licensed.
