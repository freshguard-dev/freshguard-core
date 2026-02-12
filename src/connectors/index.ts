/**
 * Database connectors for FreshGuard Core
 *
 * Each connector extends {@link BaseConnector} and implements the read-only
 * {@link Connector} interface with built-in SQL-injection prevention, query
 * timeouts, and error sanitization.
 *
 * Pick the connector that matches your data warehouse, instantiate it with a
 * {@link ConnectorConfig}, and pass it to any monitoring function
 * (`checkFreshness`, `checkVolumeAnomaly`, `checkSchemaChanges`).
 *
 * @example
 * ```typescript
 * import { PostgresConnector, checkFreshness } from '@freshguard/freshguard-core';
 *
 * const pg = new PostgresConnector({
 *   host: 'localhost', port: 5432,
 *   database: 'analytics', username: 'reader', password: 'secret', ssl: true,
 * });
 *
 * const result = await checkFreshness(pg, rule);
 * ```
 *
 * @module @freshguard/freshguard-core/connectors
 */

export { PostgresConnector } from './postgres.js';
export { DuckDBConnector } from './duckdb.js';
export { BigQueryConnector } from './bigquery.js';
export { SnowflakeConnector } from './snowflake.js';
export { MySQLConnector } from './mysql.js';
export { RedshiftConnector } from './redshift.js';
export { MSSQLConnector } from './mssql.js';
export { AzureSQLConnector } from './azure-sql.js';
export { SynapseConnector } from './synapse.js';
