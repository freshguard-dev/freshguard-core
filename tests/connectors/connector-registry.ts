/**
 * Connector configuration registry for integration tests
 *
 * Each entry defines how to create, configure, and availability-check a connector.
 * Docker-based connectors (Postgres, MySQL, Redshift, MSSQL, DuckDB) run locally;
 * cloud connectors (BigQuery, Snowflake, AzureSQL, Synapse) are gated by env vars.
 */

import { PostgresConnector } from '../../src/connectors/postgres.js';
import { DuckDBConnector } from '../../src/connectors/duckdb.js';
import { BigQueryConnector } from '../../src/connectors/bigquery.js';
import { SnowflakeConnector } from '../../src/connectors/snowflake.js';
import { MySQLConnector } from '../../src/connectors/mysql.js';
import { RedshiftConnector } from '../../src/connectors/redshift.js';
import { MSSQLConnector } from '../../src/connectors/mssql.js';
import { AzureSQLConnector } from '../../src/connectors/azure-sql.js';
import { SynapseConnector } from '../../src/connectors/synapse.js';
import type { Connector } from '../../src/types/connector.js';

export interface ConnectorRegistryEntry {
  name: string;
  type: string;
  createConnector: () => Connector;
  isAvailable: () => boolean;
  skipReason: () => string;
}

/** Shared security config that disables SSL and permits test queries */
export const TEST_SECURITY_CONFIG = {
  requireSSL: false,
  connectionTimeout: 30000,
  queryTimeout: 10000,
  maxRows: 1000,
  allowedQueryPatterns: [
    /^SELECT 1/i,
    /^SELECT COUNT\(\*\) as count FROM/i,
    /^SELECT COUNT\(\*\) FROM/i,
    /^SELECT MAX\(.+\) as .+ FROM/i,
    /^SELECT MAX\(/i,
    /^SELECT MIN\(/i,
    /^DESCRIBE /i,
    /^SHOW /i,
    /SELECT .+ FROM information_schema\./is,
    /^SELECT table_name\s+FROM information_schema\.tables/is,
    /^SELECT .+ FROM .+ WHERE/is,
    /^SELECT .+ FROM .+ ORDER BY/is,
    /^SELECT TOP/i,
    /^PRAGMA /i,
    /^SELECT name FROM sqlite_master/i,
    /^SELECT \* FROM duckdb_tables/i,
  ],
  blockedKeywords: [
    'INSERT', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE',
    '--', '/*', '*/', 'EXEC', 'EXECUTE', 'xp_', 'sp_',
  ],
};

function envDefined(...vars: string[]): boolean {
  return vars.every((v) => !!process.env[v]);
}

export const CONNECTOR_REGISTRY: ConnectorRegistryEntry[] = [
  // ── Docker-based connectors ──────────────────────────────────────

  {
    name: 'PostgreSQL',
    type: 'postgres',
    createConnector: () =>
      new PostgresConnector(
        { host: 'localhost', port: 5433, database: 'freshguard_test', username: 'test', password: 'test', ssl: false },
        TEST_SECURITY_CONFIG,
      ),
    isAvailable: () => true, // assume docker service may be running
    skipReason: () => 'PostgreSQL docker service not running (port 5433)',
  },

  {
    name: 'MySQL',
    type: 'mysql',
    createConnector: () =>
      new MySQLConnector(
        { host: 'localhost', port: 3307, database: 'freshguard_test', username: 'test', password: 'test', ssl: false },
        TEST_SECURITY_CONFIG,
      ),
    isAvailable: () => true,
    skipReason: () => 'MySQL docker service not running (port 3307)',
  },

  {
    name: 'Redshift (simulated)',
    type: 'redshift',
    createConnector: () =>
      new RedshiftConnector(
        { host: 'localhost', port: 5435, database: 'freshguard_test', username: 'test', password: 'test', ssl: false },
        TEST_SECURITY_CONFIG,
      ),
    isAvailable: () => true,
    skipReason: () => 'Redshift docker service not running (port 5435)',
  },

  {
    name: 'MSSQL',
    type: 'mssql',
    createConnector: () =>
      new MSSQLConnector(
        { host: 'localhost', port: 1434, database: 'freshguard_test', username: 'sa', password: 'FreshGuard_Test1!', ssl: false },
        TEST_SECURITY_CONFIG,
      ),
    isAvailable: () => true,
    skipReason: () => 'MSSQL docker service not running (port 1434)',
  },

  {
    name: 'DuckDB',
    type: 'duckdb',
    createConnector: () =>
      new DuckDBConnector(
        { host: 'localhost', port: 0, database: '/tmp/customer_test.duckdb', username: 'duckdb', password: 'duckdb', ssl: false },
        TEST_SECURITY_CONFIG,
      ),
    isAvailable: () => true,
    skipReason: () => 'DuckDB test database not found at /tmp/customer_test.duckdb',
  },

  // ── Cloud connectors (env-var gated) ─────────────────────────────

  {
    name: 'BigQuery',
    type: 'bigquery',
    createConnector: () =>
      new BigQueryConnector(
        {
          host: 'bigquery.googleapis.com',
          port: 443,
          database: process.env.TEST_BQ_PROJECT!,
          username: 'service-account',
          password: process.env.TEST_BQ_KEY!,
          ssl: true,
          options: {
            dataset: process.env.TEST_BQ_DATASET,
            location: process.env.TEST_BQ_LOCATION ?? 'US',
          },
        },
        { ...TEST_SECURITY_CONFIG, requireSSL: true },
      ),
    isAvailable: () => envDefined('TEST_BQ_PROJECT', 'TEST_BQ_KEY'),
    skipReason: () => 'BigQuery env vars not set (TEST_BQ_PROJECT, TEST_BQ_KEY)',
  },

  {
    name: 'Snowflake',
    type: 'snowflake',
    createConnector: () =>
      new SnowflakeConnector(
        {
          host: process.env.TEST_SF_HOST!,
          port: 443,
          database: process.env.TEST_SF_DATABASE!,
          username: process.env.TEST_SF_USERNAME!,
          password: process.env.TEST_SF_PASSWORD!,
          ssl: true,
          options: {
            warehouse: process.env.TEST_SF_WAREHOUSE,
            schema: process.env.TEST_SF_SCHEMA ?? 'PUBLIC',
          },
        },
        { ...TEST_SECURITY_CONFIG, requireSSL: true },
      ),
    isAvailable: () => envDefined('TEST_SF_HOST', 'TEST_SF_DATABASE', 'TEST_SF_USERNAME', 'TEST_SF_PASSWORD'),
    skipReason: () => 'Snowflake env vars not set (TEST_SF_HOST, TEST_SF_DATABASE, TEST_SF_USERNAME, TEST_SF_PASSWORD)',
  },

  {
    name: 'Azure SQL',
    type: 'azure_sql',
    createConnector: () =>
      new AzureSQLConnector(
        {
          host: process.env.TEST_AZURE_SQL_HOST!,
          port: 1433,
          database: process.env.TEST_AZURE_SQL_DATABASE!,
          username: process.env.TEST_AZURE_SQL_USERNAME!,
          password: process.env.TEST_AZURE_SQL_PASSWORD!,
          ssl: true,
        },
        { ...TEST_SECURITY_CONFIG, requireSSL: true },
      ),
    isAvailable: () => envDefined('TEST_AZURE_SQL_HOST', 'TEST_AZURE_SQL_DATABASE', 'TEST_AZURE_SQL_USERNAME', 'TEST_AZURE_SQL_PASSWORD'),
    skipReason: () => 'Azure SQL env vars not set (TEST_AZURE_SQL_HOST, TEST_AZURE_SQL_DATABASE, TEST_AZURE_SQL_USERNAME, TEST_AZURE_SQL_PASSWORD)',
  },

  {
    name: 'Synapse',
    type: 'synapse',
    createConnector: () =>
      new SynapseConnector(
        {
          host: process.env.TEST_SYNAPSE_HOST!,
          port: 1433,
          database: process.env.TEST_SYNAPSE_DATABASE!,
          username: process.env.TEST_SYNAPSE_USERNAME!,
          password: process.env.TEST_SYNAPSE_PASSWORD!,
          ssl: true,
        },
        { ...TEST_SECURITY_CONFIG, requireSSL: true },
      ),
    isAvailable: () => envDefined('TEST_SYNAPSE_HOST', 'TEST_SYNAPSE_DATABASE', 'TEST_SYNAPSE_USERNAME', 'TEST_SYNAPSE_PASSWORD'),
    skipReason: () => 'Synapse env vars not set (TEST_SYNAPSE_HOST, TEST_SYNAPSE_DATABASE, TEST_SYNAPSE_USERNAME, TEST_SYNAPSE_PASSWORD)',
  },
];
