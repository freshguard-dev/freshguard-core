/**
 * Factory for creating metadata storage instances
 */

import type { MetadataStorage } from './interface.js';
import type { MetadataStorageConfig } from './types.js';
import { DuckDBMetadataStorage } from './duckdb-storage.js';
import { PostgreSQLMetadataStorage } from './postgresql-storage.js';

/**
 * Create and initialize a metadata storage instance.
 *
 * Defaults to embedded DuckDB when called without arguments (zero-setup).
 * Pass a config object to use PostgreSQL or customize the DuckDB path.
 *
 * @param config - Optional storage configuration. Omit for default DuckDB storage.
 * @returns Initialized MetadataStorage ready for use
 * @throws {Error} If `type` is `'postgresql'` and `url` is not provided
 *
 * @example
 * ```typescript
 * // Zero-setup DuckDB (default)
 * const storage = await createMetadataStorage();
 *
 * // Custom DuckDB path
 * const storage = await createMetadataStorage({ type: 'duckdb', path: './data/meta.db' });
 *
 * // PostgreSQL
 * const storage = await createMetadataStorage({
 *   type: 'postgresql',
 *   url: 'postgresql://user:pass@host:5432/freshguard_metadata',
 * });
 * ```
 *
 * @since 0.6.0
 */
export async function createMetadataStorage(
  config?: MetadataStorageConfig
): Promise<MetadataStorage> {
  let storage: MetadataStorage;

  if (!config) {
    // Default to DuckDB for simplicity
    storage = new DuckDBMetadataStorage();
  } else if (config.type === 'duckdb') {
    storage = new DuckDBMetadataStorage(config.path);
  } else if (config.type === 'postgresql') {
    if (!config.url) {
      throw new Error('PostgreSQL URL is required');
    }
    storage = new PostgreSQLMetadataStorage(config.url, config);
  } else {
    const _exhaustiveCheck: never = config.type;
    throw new Error(`Unknown storage type: ${_exhaustiveCheck as string}`);
  }

  await storage.initialize();
  return storage;
}