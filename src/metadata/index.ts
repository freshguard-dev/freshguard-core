/**
 * Metadata storage for persisting check execution history
 *
 * FreshGuard uses a metadata store to record every check execution so that
 * volume-anomaly baselines and historical trends are available across runs.
 *
 * Use the {@link createMetadataStorage} factory to create an instance:
 * - **DuckDB** (default, zero-setup) — embedded file or `:memory:`
 * - **PostgreSQL** — shared metadata across multiple workers
 *
 * @example
 * ```typescript
 * import { createMetadataStorage } from '@freshguard/freshguard-core';
 *
 * // Zero-setup embedded DuckDB (default)
 * const storage = await createMetadataStorage();
 *
 * // PostgreSQL for shared deployments
 * const pgStorage = await createMetadataStorage({
 *   type: 'postgresql',
 *   url: process.env.METADATA_DATABASE_URL!,
 * });
 * ```
 *
 * @module @freshguard/freshguard-core/metadata
 */

export type { MetadataStorage } from './interface.js';
export type { MetadataCheckExecution, MetadataMonitoringRule, MetadataStorageConfig } from './types.js';
export { createMetadataStorage } from './factory.js';
export { DuckDBMetadataStorage } from './duckdb-storage.js';
export { PostgreSQLMetadataStorage } from './postgresql-storage.js';