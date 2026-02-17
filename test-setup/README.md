# Test Setup Guide

This directory contains SQL init scripts and helpers for setting up integration test databases.

## Overview

FreshGuard Core integration tests require real databases with test data to verify:
- Database connector functionality (all `Connector` interface methods)
- Monitoring algorithms with realistic timestamps (`checkFreshness`, `checkVolumeAnomaly`, `checkSchemaChanges`)
- Security validation with actual database operations

## Quick Start

### Run All Docker-Based Connectors

```bash
# Start all services (Postgres, MySQL, Redshift simulator, MSSQL), setup DuckDB, run tests
pnpm test:connectors:docker
```

### Step-by-Step

```bash
# 1. Start Docker services
pnpm test:services:start

# 2. Wait for health checks (~15–30s, MSSQL takes the longest)
sleep 30

# 3. Setup DuckDB test database
pnpm test:db:setup

# 4. Run the comprehensive connector integration tests
pnpm test:connectors
```

### Run Default Test Suite (No Docker Required)

```bash
# Unit + existing integration tests — the comprehensive connector tests are excluded
pnpm test:coverage
```

## Supported Databases

### Docker-Based (Local)

| Database | Docker Image | Port | Credentials | Init Script |
|----------|-------------|------|-------------|-------------|
| **PostgreSQL** | `postgres:15` | `5433` | `test` / `test` / `freshguard_test` | `init-postgres.sql` |
| **MySQL** | `mysql:8.0` | `3307` | `test` / `test` / `freshguard_test` | `init-mysql.sql` |
| **Redshift** (simulated) | `postgres:14` | `5435` | `test` / `test` / `freshguard_test` | `init-redshift.sql` |
| **MSSQL** | `mcr.microsoft.com/mssql/server:2022-latest` | `1434` | `sa` / `FreshGuard_Test1!` / `freshguard_test` | `init-mssql.sql` |
| **DuckDB** | N/A (file-based) | N/A | N/A | `init-duckdb.sql` via `setup-duckdb.js` |

### Cloud-Based (Environment Variable Gated)

These connectors skip automatically unless the corresponding env vars are set.

| Database | Required Environment Variables |
|----------|-------------------------------|
| **BigQuery** | `TEST_BQ_PROJECT`, `TEST_BQ_KEY` (optional: `TEST_BQ_DATASET`, `TEST_BQ_LOCATION`) |
| **Snowflake** | `TEST_SF_HOST`, `TEST_SF_DATABASE`, `TEST_SF_USERNAME`, `TEST_SF_PASSWORD` (optional: `TEST_SF_WAREHOUSE`, `TEST_SF_SCHEMA`) |
| **Azure SQL** | `TEST_AZURE_SQL_HOST`, `TEST_AZURE_SQL_DATABASE`, `TEST_AZURE_SQL_USERNAME`, `TEST_AZURE_SQL_PASSWORD` |
| **Synapse** | `TEST_SYNAPSE_HOST`, `TEST_SYNAPSE_DATABASE`, `TEST_SYNAPSE_USERNAME`, `TEST_SYNAPSE_PASSWORD` |

#### Example: Running with BigQuery

```bash
export TEST_BQ_PROJECT=my-gcp-project
export TEST_BQ_KEY='{"type":"service_account",...}'
export TEST_BQ_DATASET=freshguard_test
pnpm test:connectors
```

## Test Data Schema

All databases contain the same 5 tables with identical data shapes. Each init script adapts the SQL dialect as needed.

### Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `customers` | 5 | Customer master data |
| `products` | 5 | Product catalog |
| `orders` | 8 | Transactional order data (primary monitoring target) |
| `daily_summary` | 3 | Pre-aggregated daily metrics |
| `user_sessions` | 5 | Session/activity tracking |

### Column Reference

#### `customers`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INT / SERIAL | No | Primary key, auto-increment |
| `name` | VARCHAR(255) | No | |
| `email` | VARCHAR(255) | No | Unique |
| `created_at` | TIMESTAMP | Yes | Default: now |
| `updated_at` | TIMESTAMP | Yes | Default: now |

#### `products`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INT / SERIAL | No | Primary key, auto-increment |
| `name` | VARCHAR(255) | No | |
| `price` | DECIMAL(10,2) | No | |
| `category` | VARCHAR(100) | Yes | |
| `created_at` | TIMESTAMP | Yes | Default: now |
| `updated_at` | TIMESTAMP | Yes | Default: now |

#### `orders`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INT / SERIAL | No | Primary key, auto-increment |
| `customer_id` | INT | Yes | FK → customers.id (where supported) |
| `product_id` | INT | Yes | FK → products.id (where supported) |
| `quantity` | INT | No | Default: 1 |
| `total_amount` | DECIMAL(10,2) | No | |
| `status` | VARCHAR(50) | Yes | `pending`, `completed`, `shipped` |
| `order_date` | TIMESTAMP | Yes | Default: now |
| `updated_at` | TIMESTAMP | Yes | Default: now; **primary freshness column** |

#### `daily_summary`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INT / SERIAL | No | Primary key, auto-increment |
| `summary_date` | DATE | No | |
| `total_orders` | INT | No | Default: 0 |
| `total_revenue` | DECIMAL(12,2) | No | Default: 0 |
| `unique_customers` | INT | No | Default: 0 |
| `created_at` | TIMESTAMP | Yes | Default: now |
| `updated_at` | TIMESTAMP | Yes | Default: now |

#### `user_sessions`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | INT / SERIAL | No | Primary key, auto-increment |
| `user_id` | INT | No | |
| `session_token` | VARCHAR(255) | No | Unique |
| `ip_address` | INET / VARCHAR(45) | Yes | INET on Postgres; VARCHAR elsewhere |
| `user_agent` | TEXT / NVARCHAR(MAX) | Yes | |
| `started_at` | TIMESTAMP | Yes | Default: now |
| `last_activity` | TIMESTAMP | Yes | Default: now |
| `updated_at` | TIMESTAMP | Yes | Default: now |

### Data Freshness

All `updated_at` values are relative to insert time (e.g. `CURRENT_TIMESTAMP - INTERVAL '15 minutes'`), so test data is always recent when containers start fresh. The integration tests expect:

- `orders.updated_at` max value < 24 hours old
- Row counts > 0 for all tables

### Dialect Differences

| Feature | PostgreSQL | MySQL | Redshift (sim) | MSSQL | DuckDB |
|---------|-----------|-------|----------------|-------|--------|
| Auto-increment | `SERIAL` | `AUTO_INCREMENT` | `IDENTITY(1,1)` | `IDENTITY(1,1)` | `INTEGER` |
| Timestamp type | `TIMESTAMP` | `TIMESTAMP` | `TIMESTAMP` | `DATETIME2` | `TIMESTAMP` |
| Current time | `CURRENT_TIMESTAMP` | `NOW()` | `CURRENT_TIMESTAMP` | `GETDATE()` | `CURRENT_TIMESTAMP` |
| IP address | `INET` | `VARCHAR(45)` | `VARCHAR(45)` | `NVARCHAR(45)` | `VARCHAR(45)` |
| Long text | `TEXT` | `TEXT` | `VARCHAR(MAX)` | `NVARCHAR(MAX)` | `VARCHAR` |
| Foreign keys | Yes | Yes | No | Yes | No |
| Idempotent create | `IF NOT EXISTS` | `IF NOT EXISTS` | `IF NOT EXISTS` | `IF OBJECT_ID IS NULL` | `IF NOT EXISTS` |
| Schema | `public` | (database) | `public` | `dbo` | `main` |

## What the Tests Cover

The comprehensive integration test (`tests/connectors/integration-all.test.ts`) runs this matrix for each available connector:

| Test | Method | Validates |
|------|--------|-----------|
| testConnection | `testConnection()` | Can connect to the database |
| listTables | `listTables()` | Returns the 5 expected tables |
| getTableSchema | `getTableSchema('orders')` | Returns columns including `updated_at` |
| getRowCount | `getRowCount('orders')` | Returns count > 0 |
| getMaxTimestamp | `getMaxTimestamp('orders', 'updated_at')` | Returns recent Date (< 24h) |
| getMinTimestamp | `getMinTimestamp('orders', 'updated_at')` | Returns a valid Date |
| getLastModified | `getLastModified('orders')` | Returns Date or throws (base impl) |
| checkFreshness | `checkFreshness(connector, rule)` | Returns status `ok`, `lagMinutes` defined |
| checkVolumeAnomaly | `checkVolumeAnomaly(connector, rule)` | Returns status `ok`, `rowCount` > 0 |
| checkSchemaChanges | `checkSchemaChanges(connector, rule)` | Returns status `ok`, captures baseline |

A summary table is printed at the end showing pass/fail/skip per connector.

## npm Scripts

| Script | Description |
|--------|-------------|
| `pnpm test:services:start` | Start all Docker test services |
| `pnpm test:services:stop` | Stop all Docker test services |
| `pnpm test:services:logs` | Tail Docker service logs |
| `pnpm test:db:setup` | Create DuckDB test database |
| `pnpm test:db:setup:all` | Start services + wait + setup DuckDB |
| `pnpm test:connectors` | Run comprehensive connector integration tests |
| `pnpm test:connectors:docker` | Start services + setup + run connector tests |
| `pnpm test:coverage` | Run default test suite (excludes connector integration tests) |

## File Structure

```
test-setup/
├── README.md              # This file
├── init-postgres.sql      # PostgreSQL schema and test data
├── init-mysql.sql         # MySQL schema and test data
├── init-redshift.sql      # Redshift (PostgreSQL-simulated) schema and test data
├── init-mssql.sql         # SQL Server (T-SQL) schema and test data
├── init-duckdb.sql        # DuckDB schema and test data
└── setup-duckdb.js        # Node.js script to create DuckDB file database
```

## Troubleshooting

### Docker Services Won't Start

```bash
# Check running containers
docker ps

# Check logs for a specific service
docker compose -f docker-compose.test.yml logs mssql_test

# Nuclear restart
pnpm test:services:stop
docker volume prune -f
pnpm test:services:start
```

### MSSQL Takes Too Long to Start

MSSQL Server needs ~20–30 seconds for first startup. The `mssql_init` container waits for the health check before seeding. If tests skip MSSQL, increase the sleep:

```bash
pnpm test:services:start && sleep 45 && pnpm test:connectors
```

### DuckDB Native Bindings Missing

```
Error: Cannot resolve module '@duckdb/node-api'
```

This is expected in some environments. DuckDB tests will skip gracefully.

### Tests Pass Locally but Skip in CI

Ensure your CI workflow starts Docker services and waits for health checks before running `pnpm test:connectors`. See the GitHub Actions example in the `Integration with CI/CD` section of the project docs.

## Adding a New Database

1. Create `test-setup/init-<dbname>.sql` with the same 5 tables and data
2. Add a Docker service to `docker-compose.test.yml` (if applicable)
3. Add an entry to `tests/connectors/connector-registry.ts`
4. Run `pnpm test:connectors` to verify

## Data Freshness in Long-Running Environments

Timestamps are relative to container start time. If containers have been running for more than 24 hours, the freshness tests may fail. Restart containers to refresh:

```bash
pnpm test:services:stop && pnpm test:services:start
```
