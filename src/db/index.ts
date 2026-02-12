/**
 * Database connection and schema exports
 *
 * Creates a Drizzle ORM connection to the FreshGuard metadata database
 * (PostgreSQL). Used internally for storing check executions, alert logs,
 * and monitoring rules.
 *
 * @module @freshguard/freshguard-core/db
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export { schema };

/**
 * Create a Drizzle ORM database connection to a PostgreSQL instance.
 *
 * @param connectionString - PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`)
 * @returns Drizzle database instance with the FreshGuard schema loaded
 *
 * @example
 * ```typescript
 * import { createDatabase } from '@freshguard/freshguard-core';
 *
 * const db = createDatabase(process.env.DATABASE_URL!);
 * ```
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
