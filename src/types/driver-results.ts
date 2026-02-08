/**
 * Type definitions for database driver query results
 *
 * These interfaces replace `any` in database connector code to provide
 * type safety for query results from various database drivers.
 *
 * @license MIT
 */

/**
 * Generic row returned from any database query.
 * Uses `unknown` values to force callers to narrow types before use.
 */
export type QueryResultRow = Record<string, unknown>;

/**
 * Row returned from a COUNT(*) query
 */
export interface CountResultRow extends QueryResultRow {
  count?: string | number;
}

/**
 * Row returned from a MAX/MIN timestamp query
 */
export interface TimestampResultRow extends QueryResultRow {
  max_date?: unknown;
  min_date?: unknown;
  last_modified?: unknown;
}

/**
 * Row returned from information_schema.tables
 */
export interface TableNameRow extends QueryResultRow {
  table_name?: string;
  TABLE_NAME?: string;
  tablename?: string;
}

/**
 * Row returned from information_schema.columns
 */
export interface ColumnMetadataRow extends QueryResultRow {
  column_name?: string;
  COLUMN_NAME?: string;
  data_type?: string;
  DATA_TYPE?: string;
  is_nullable?: string;
  IS_NULLABLE?: string;
}

/**
 * Safely convert an unknown database value to a string.
 * Handles the common pattern of accessing unknown values from QueryResultRow.
 */
export function rowString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}
