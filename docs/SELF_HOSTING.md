# Self-Hosting FreshGuard Core

Guide for self-hosting FreshGuard Core in your own environment.

## What You Get (Free, Self-Hosted)

✅ **Basic Security** - Input validation, SQL injection protection, secure connections
✅ **Core Monitoring** - Freshness, volume anomaly detection, and schema change monitoring
✅ **Multi-Database Support** - PostgreSQL, BigQuery, Snowflake, DuckDB, MySQL, Redshift, SQL Server, Azure SQL, Azure Synapse
✅ **Structured Logging** - JSON logging with error sanitization
✅ **Custom Integration** - Build your own alerting with the API
✅ **Full Control** - Your data stays on your infrastructure
✅ **CLI Tool** - Command-line interface for basic operations

## What's Not Included (Cloud-Only)

❌ **Multi-tenant Dashboard** - You get programmatic API or config files
❌ **Uptime SLA** - Your uptime = your responsibility
❌ **Managed Infrastructure** - You handle deployment and scaling

## Quick Start

### Installation

```bash
pnpm add @freshguard/freshguard-core
```

### Basic Setup

```typescript
import { PostgresConnector, checkFreshness } from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

// Basic configuration
const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!) || 5432,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,     // Use read-only user
  password: process.env.DB_PASSWORD!, // From environment variables
  ssl: true,                          // Enable SSL
  // options: { schema: 'analytics' } // Uncomment if your tables are in a non-default schema
});

// Define monitoring rule
const rule: MonitoringRule = {
  id: 'orders-freshness',
  sourceId: 'main_db',
  name: 'Orders Freshness Check',
  tableName: 'orders',
  ruleType: 'freshness',
  toleranceMinutes: 60,
  timestampColumn: 'created_at',
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Check freshness
const result = await checkFreshness(connector, rule);
console.log(`Status: ${result.status}, Lag: ${result.lagMinutes}m`);
```

## Security Best Practices

FreshGuard Core includes basic security features that are enabled by default.

### Connection Security

```typescript
import { PostgresConnector } from '@freshguard/freshguard-core';

// Secure connection configuration
const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!) || 5432,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,     // Use dedicated read-only user
  password: process.env.DB_PASSWORD!, // Store in environment variables
  ssl: true,                          // Always use SSL in production
});
```

### Environment Variables

Always use environment variables for sensitive configuration:

```bash
# Required database configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=freshguard_readonly
DB_PASSWORD=secure-random-password

# Application configuration
NODE_ENV=production
LOG_LEVEL=info
```

### Minimum Database Permissions

FreshGuard only performs read-only monitoring queries. Every connector needs at minimum:

1. **Connect** to the database
2. **SELECT** on the monitored tables (for `COUNT(*)`, `MAX()`, `MIN()`)
3. **Read metadata** (table names, column types) — typically automatic via `information_schema`

Some connectors have **optional fallback queries** for `getLastModified()` that require
elevated permissions. These fail gracefully — FreshGuard returns `null` for last-modified
and continues operating normally without them.

Below are the recommended role setups for each database. Replace placeholder names
(`freshguard`, `mydb`, `target_schema`, etc.) with your values.

#### PostgreSQL

```sql
-- 1. Create a dedicated role with login
CREATE ROLE freshguard LOGIN PASSWORD 'secure_random_password' CONNECTION LIMIT 2;

-- 2. Grant connect and schema access
GRANT CONNECT ON DATABASE mydb TO freshguard;
GRANT USAGE ON SCHEMA public TO freshguard;

-- 3. Grant read-only access to tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO freshguard;
-- For future tables created in this schema:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO freshguard;

-- 4. RECOMMENDED: Server-side write protection (defense-in-depth)
--    This prevents writes even if the application-level query blocklist is bypassed.
ALTER ROLE freshguard SET default_transaction_read_only = 'on';
```

No elevated permissions are needed. The `getLastModified()` fallback uses
`pg_stat_get_last_analyze_time()` which is accessible to all roles (PUBLIC) by default.

> **Non-default schema?** Replace `public` above with your schema name, and pass
> `options: { schema: 'your_schema' }` in the connector config.

#### MySQL

```sql
-- 1. Create a dedicated user with SELECT-only access
CREATE USER 'freshguard'@'%' IDENTIFIED BY 'secure_random_password';
GRANT SELECT ON mydb.* TO 'freshguard'@'%';

-- To restrict to specific tables instead:
-- GRANT SELECT ON mydb.orders TO 'freshguard'@'%';
-- GRANT SELECT ON mydb.events TO 'freshguard'@'%';
```

MySQL's `information_schema` automatically filters to only show objects the user can access.
The `getLastModified()` fallback reads `information_schema.tables.update_time`, which requires
no extra permissions.

#### Redshift

```sql
-- 1. Create a dedicated user
CREATE USER freshguard PASSWORD 'secure_random_password';

-- 2. Grant schema and table access
GRANT USAGE ON SCHEMA public TO freshguard;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO freshguard;
```

**Optional elevated permission:** `getLastModified()` tries `svv_table_info` first, which
requires superuser or the `SYS:MONITOR` role. If unavailable it falls back to
`pg_stat_user_tables` (accessible to the table owner) and then to timestamp column probing.
You do **not** need to grant superuser or `SYS:MONITOR` for FreshGuard to work.

#### SQL Server (MSSQL)

```sql
-- 1. Create a dedicated login and user
CREATE LOGIN freshguard WITH PASSWORD = 'secure_random_password';
USE mydb;
CREATE USER freshguard FOR LOGIN freshguard;

-- 2. Grant read-only access
GRANT SELECT ON SCHEMA::dbo TO freshguard;

-- 3. OPTIONAL: Improve getLastModified() accuracy
--    sys.dm_db_index_usage_stats requires VIEW DATABASE STATE.
--    This permission exposes DMV data about ALL database activity,
--    so only grant it if the trade-off is acceptable for your environment.
-- GRANT VIEW DATABASE STATE TO freshguard;
```

> **Non-default schema?** Replace `dbo` above with your schema name, and pass
> `options: { schema: 'your_schema' }` in the connector config.

#### Azure SQL Database

```sql
-- Same as SQL Server, but note:
-- 1. SSL/TLS is always enforced (Azure requirement)
-- 2. Ensure the FreshGuard host IP is allowed in Azure SQL firewall rules

CREATE USER freshguard FROM EXTERNAL PROVIDER;  -- For Azure AD
-- OR: Use SQL authentication as in the MSSQL example above

GRANT SELECT ON SCHEMA::dbo TO freshguard;

-- OPTIONAL: VIEW DATABASE STATE for getLastModified() DMV fallback
-- GRANT VIEW DATABASE STATE TO freshguard;
```

> **Additional hardening:** Use Azure SQL server-level and database-level firewall rules
> to restrict connections to only the FreshGuard host IP addresses.

#### Azure Synapse Analytics

```sql
-- 1. Create a dedicated user
CREATE USER freshguard FROM LOGIN freshguard;

-- 2. Grant read-only access
GRANT SELECT ON SCHEMA::dbo TO freshguard;

-- 3. OPTIONAL: VIEW DATABASE STATE for getLastModified() DMV fallback
--    CAUTION: On Synapse, this grants access to sys.dm_pdw_exec_requests which
--    exposes the full SQL text of ALL queries executed in the warehouse by any user.
--    Only grant this if the information-disclosure trade-off is acceptable.
-- GRANT VIEW DATABASE STATE TO freshguard;
```

Without `VIEW DATABASE STATE`, `getLastModified()` still works by probing common timestamp
columns (`updated_at`, `modified_at`, etc.) on the monitored tables.

#### Snowflake

```sql
-- 1. Create a dedicated role and user
CREATE ROLE freshguard_role;
CREATE USER freshguard
  PASSWORD = 'secure_random_password'
  DEFAULT_ROLE = freshguard_role;
GRANT ROLE freshguard_role TO USER freshguard;

-- 2. Grant warehouse access (required to execute any query)
GRANT USAGE ON WAREHOUSE compute_wh TO ROLE freshguard_role;

-- 3. Grant database and schema access
GRANT USAGE ON DATABASE analytics TO ROLE freshguard_role;
GRANT USAGE ON SCHEMA analytics.PUBLIC TO ROLE freshguard_role;

-- 4. Grant read-only table access
GRANT SELECT ON ALL TABLES IN SCHEMA analytics.PUBLIC TO ROLE freshguard_role;
-- For future tables:
GRANT SELECT ON FUTURE TABLES IN SCHEMA analytics.PUBLIC TO ROLE freshguard_role;
```

No elevated permissions are needed. Snowflake does not have a system view for table
modification times, so `getLastModified()` relies on probing timestamp columns only.

> **Cost tip:** Use a dedicated XS warehouse with aggressive auto-suspend (e.g. 60 seconds)
> to minimize credit usage from monitoring queries.

#### Google BigQuery

BigQuery uses IAM roles instead of SQL grants:

```bash
# Minimum: grant Data Viewer on the specific dataset (not the whole project)
bq update \
  --grant_to='serviceAccount:freshguard@my-project.iam.gserviceaccount.com' \
  --role='roles/bigquery.dataViewer' \
  my_dataset

# Required at project level: Job User (needed to run any query)
gcloud projects add-iam-policy-binding my-gcp-project \
  --member='serviceAccount:freshguard@my-project.iam.gserviceaccount.com' \
  --role='roles/bigquery.jobUser'
```

Prefer **dataset-level** `bigquery.dataViewer` over project-level to limit access to only
the monitored datasets. `bigquery.jobUser` must be project-level (BigQuery limitation).

`getLastModified()` uses the BigQuery table metadata API (`tables.get`), which is covered
by the `dataViewer` role.

#### DuckDB

DuckDB is a local embedded database — no network credentials are needed. Access is
controlled by filesystem permissions:

- Grant the FreshGuard process **read-only** access to the `.duckdb` file
- Run FreshGuard under a dedicated OS user with minimal filesystem permissions
- The connector blocks access to system directories (`/etc`, `/sys`, `/proc`, etc.) by default

## Production Deployment

## Using the CLI Tool

The included CLI provides basic operations:

```bash
# Set up your database connection
export FRESHGUARD_DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Initialize configuration
pnpm exec freshguard init

# Test the connection
pnpm exec freshguard test

# Run basic monitoring
pnpm exec freshguard run
```

## Docker Example (Basic)

A simple Docker setup for reference:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use environment variables for configuration
ENV NODE_ENV=production

CMD ["node", "dist/your-app.js"]
```

## Environment Configuration

Set up your environment variables:

```bash
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=freshguard_readonly
DB_PASSWORD=your_secure_password

# Application settings
NODE_ENV=production
LOG_LEVEL=info
```

## Basic Monitoring

### Simple Health Check

Create a basic health check for your monitoring:

```typescript
import { PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

// Simple health check function
async function healthCheck() {
  try {
    await connector.testConnection();
    console.log('✅ Database connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Run health check
healthCheck();
```

### Logging

FreshGuard Core includes structured logging. Logs are output in JSON format and can be collected by your logging system.

```typescript
// Logs are automatically generated by connectors
// Example log output:
{
  "level": "info",
  "time": "2024-01-22T10:30:00.000Z",
  "operation": "checkFreshness",
  "table": "orders",
  "duration": 150,
  "success": true
}
```

## Data Freshness Monitoring

### Programmatic Monitoring

Build your own monitoring system using the core API:

```typescript
import {
  PostgresConnector,
  checkFreshness,
  checkVolumeAnomaly,
  createMetadataStorage
} from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

// Set up database connection
const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

// Set up metadata storage (for volume monitoring)
const metadataStorage = await createMetadataStorage();

// Define monitoring rules
const freshnessRule: MonitoringRule = {
  id: 'orders-freshness',
  sourceId: 'main_db',
  name: 'Orders Freshness Check',
  tableName: 'orders',
  ruleType: 'freshness',
  toleranceMinutes: 60,
  timestampColumn: 'created_at',
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const volumeRule: MonitoringRule = {
  id: 'orders-volume',
  sourceId: 'main_db',
  name: 'Orders Volume Check',
  tableName: 'orders',
  ruleType: 'volume_anomaly',
  checkIntervalMinutes: 15,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Run checks
async function runMonitoring() {
  try {
    // Check freshness
    const freshnessResult = await checkFreshness(connector, freshnessRule);
    if (freshnessResult.status === 'alert') {
      console.log(`⚠️ Data is stale: ${freshnessResult.lagMinutes}m`);
      // Send your own alerts here
    }

    // Check volume
    const volumeResult = await checkVolumeAnomaly(connector, volumeRule, metadataStorage);
    if (volumeResult.status === 'alert') {
      console.log(`⚠️ Volume anomaly detected`);
      // Send your own alerts here
    }

  } catch (error) {
    console.error('Monitoring check failed:', error.message);
  }
}
```

### Simple Scheduling

For regular monitoring, you can set up a simple schedule:

```typescript
// Simple monitoring loop
setInterval(async () => {
  await runMonitoring();
}, 5 * 60 * 1000); // Run every 5 minutes
```

### Custom Alerting

Build your own alerting by checking the results:

```typescript
// Example: Send Slack notification
async function sendSlackAlert(message: string) {
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
  }
}

// Use in your monitoring
if (result.status === 'alert') {
  await sendSlackAlert(`⚠️ Data freshness alert: ${result.lagMinutes}m lag`);
}
```

## Support and Resources

- **Integration Guide**: [Implementation examples](./INTEGRATION_GUIDE.md)
- **Security Guide**: [Security considerations](./SECURITY_FOR_SELF_HOSTERS.md)
- **GitHub Issues**: [Report bugs or request features](https://github.com/freshguard-dev/freshguard-core/issues)
- **GitHub Discussions**: [Ask questions and share experiences](https://github.com/freshguard-dev/freshguard-core/discussions)

## Next Steps

1. **Start Simple**: Use the CLI tool to test connectivity and basic monitoring
2. **Build Custom Logic**: Use the API to create monitoring that fits your needs
3. **Add Alerting**: Integrate with your existing notification systems
4. **Scale Up**: Deploy in your preferred environment (Docker, systemd, etc.)

## License

MIT License - Free for commercial and personal use. See [LICENSE](../LICENSE) for details.