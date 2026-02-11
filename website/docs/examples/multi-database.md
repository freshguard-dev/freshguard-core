---
sidebar_position: 4
---

# Multi-Database Monitoring

Run the same monitoring rules across different databases.

```typescript
import {
  checkFreshness,
  PostgresConnector,
  BigQueryConnector,
  SnowflakeConnector,
  MSSQLConnector,
} from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

// Set up connectors for each database
const connectors = {
  postgres: new PostgresConnector({
    host: process.env.PG_HOST!,
    database: process.env.PG_DB!,
    username: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    ssl: true,
  }),
  bigquery: new BigQueryConnector({
    host: 'bigquery.googleapis.com',
    database: process.env.GCP_PROJECT!,
    password: process.env.BIGQUERY_SERVICE_ACCOUNT_JSON!,
    ssl: true,
  }),
  snowflake: new SnowflakeConnector({
    host: process.env.SNOWFLAKE_ACCOUNT!,
    database: 'ANALYTICS',
    username: process.env.SNOWFLAKE_USER!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    ssl: true,
  }),
  sqlserver: new MSSQLConnector({
    host: process.env.MSSQL_HOST!,
    port: Number(process.env.MSSQL_PORT) || 1433,
    database: process.env.MSSQL_DB!,
    username: process.env.MSSQL_USER!,
    password: process.env.MSSQL_PASSWORD!,
    ssl: true,
  }),
};

// Define rules per source
const rules: Array<{ connector: keyof typeof connectors; rule: MonitoringRule }> = [
  {
    connector: 'postgres',
    rule: {
      id: 'pg-orders',
      sourceId: 'postgres',
      name: 'PostgreSQL Orders',
      tableName: 'orders',
      ruleType: 'freshness',
      toleranceMinutes: 60,
      timestampColumn: 'updated_at',
      checkIntervalMinutes: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    connector: 'bigquery',
    rule: {
      id: 'bq-events',
      sourceId: 'bigquery',
      name: 'BigQuery Events',
      tableName: 'analytics.events',
      ruleType: 'freshness',
      toleranceMinutes: 120,
      timestampColumn: 'event_timestamp',
      checkIntervalMinutes: 15,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    connector: 'snowflake',
    rule: {
      id: 'sf-transactions',
      sourceId: 'snowflake',
      name: 'Snowflake Transactions',
      tableName: 'TRANSACTIONS',
      ruleType: 'freshness',
      toleranceMinutes: 90,
      timestampColumn: 'CREATED_AT',
      checkIntervalMinutes: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    connector: 'sqlserver',
    rule: {
      id: 'mssql-inventory',
      sourceId: 'sqlserver',
      name: 'SQL Server Inventory',
      tableName: 'inventory',
      ruleType: 'freshness',
      toleranceMinutes: 30,
      timestampColumn: 'updated_at',
      checkIntervalMinutes: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

// Run all checks
for (const { connector: name, rule } of rules) {
  try {
    const result = await checkFreshness(connectors[name], rule);
    console.log(`[${name}] ${rule.name}: ${result.status} (lag: ${result.lagMinutes}m)`);
  } catch (error) {
    console.error(`[${name}] ${rule.name}: failed — ${(error as Error).message}`);
  }
}

// Clean up
for (const connector of Object.values(connectors)) {
  await connector.close();
}
```
