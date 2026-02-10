/**
 * FreshGuard Core - Open Source Data Pipeline Freshness Monitoring
 *
 * Monitor data pipeline freshness, volume anomalies, and schema changes across
 * PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, and Redshift.
 *
 * @example
 * ```typescript
 * import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';
 *
 * const connector = new PostgresConnector({
 *   host: 'localhost', database: 'mydb',
 *   username: 'user', password: 'pass', ssl: true,
 * });
 *
 * const result = await checkFreshness(connector, {
 *   id: 'r1', sourceId: 's1', name: 'Orders',
 *   tableName: 'orders', ruleType: 'freshness',
 *   toleranceMinutes: 60, timestampColumn: 'updated_at',
 *   checkIntervalMinutes: 5, isActive: true,
 *   createdAt: new Date(), updatedAt: new Date(),
 * });
 *
 * console.log(result.status); // 'ok' | 'alert' | 'failed'
 * ```
 *
 * @module @freshguard/freshguard-core
 * @license MIT
 * @see {@link https://freshguard-dev.github.io/freshguard-core | Documentation}
 */

// Monitoring functions
export { checkFreshness, checkVolumeAnomaly, checkSchemaChanges } from './monitor/index.js';

// Database connectors
export { PostgresConnector, DuckDBConnector, BigQueryConnector, SnowflakeConnector, MySQLConnector, RedshiftConnector } from './connectors/index.js';

// Database utilities
export { createDatabase, schema } from './db/index.js';
export type { Database } from './db/index.js';

// Metadata storage
export { createMetadataStorage, DuckDBMetadataStorage, PostgreSQLMetadataStorage } from './metadata/index.js';
export type { MetadataStorage, MetadataStorageConfig } from './metadata/index.js';

// Error classes
export {
  FreshGuardError,
  SecurityError,
  ConnectionError,
  TimeoutError,
  QueryError,
  ConfigurationError,
  MonitoringError,
  ErrorHandler,
  createError
} from './errors/index.js';

// Types
export type {
  DataSource,
  MonitoringRule,
  CheckResult,
  CheckExecution,
  AlertDestination,
  SourceCredentials,
  DataSourceType,
  RuleType,
  CheckStatus,
  AlertDestinationType,
  FreshGuardConfig,
  SchemaChanges,
  ColumnChange,
  SchemaBaseline,
} from './types.js';
