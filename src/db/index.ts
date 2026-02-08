/**
 * Database connection and schema exports
 * @module @freshguard/freshguard-core/db
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export { schema };

/**
 * Create a database connection
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database instance
 */
export function createDatabase(connectionString: string): ReturnType<typeof drizzle> {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

/**
 * Type-safe database instance
 */
export type Database = ReturnType<typeof createDatabase>;

// Export migration utilities
export {
  runMigrations,
  getCurrentVersion,
  needsMigrations,
  initializeDatabase,
  getMigrationStatus
} from './migrate.js';
