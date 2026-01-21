/**
 * DuckDB connector
 * Handles connections to DuckDB databases
 *
 * @module @thias-se/freshguard-core/connectors/duckdb
 */

import { DuckDBInstance, DuckDBConnection } from '@duckdb/node-api';
import type { SourceCredentials } from '../types.js';

/**
 * DuckDB connector
 * Connects to DuckDB database files or in-memory databases
 */
export class DuckDBConnector {
  private instance: DuckDBInstance | null = null;
  private connection: DuckDBConnection | null = null;
  private path: string = '';

  /**
   * Connect to DuckDB database
   *
   * @param credentials - Connection credentials
   */
  async connect(credentials: SourceCredentials): Promise<void> {
    try {
      // DuckDB can use connectionString as file path, or database field
      const dbPath = credentials.connectionString || credentials.database;
      this.path = dbPath || ':memory:';

      // Create DuckDB instance
      if (this.path === ':memory:') {
        this.instance = await DuckDBInstance.create();
      } else {
        this.instance = await DuckDBInstance.create(this.path);
      }

      // Get a connection from the instance
      this.connection = await this.instance.connect();
    } catch (error) {
      throw new Error(`Failed to connect to DuckDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test connection by executing a simple query
   *
   * @returns Connection test result
   */
  async testConnection(): Promise<{ success: boolean; tableCount?: number; error?: string }> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      // Test connection with a simple query
      await this.connection.run('SELECT 1 as test');

      // Count tables in the database
      const reader = await this.connection.runAndReadAll(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      `);

      const rows = reader.getRowObjects();
      const tableCount = rows[0]?.count || 0;

      return {
        success: true,
        tableCount: Number(tableCount),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List all tables in the database
   *
   * @returns Array of table names
   */
  async listTables(): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const reader = await this.connection.runAndReadAll(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        ORDER BY table_name
      `);

      const rows = reader.getRowObjects();
      return rows.map(row => row.table_name as string);
    } catch (error) {
      throw new Error(`Failed to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get table metadata (row count, last update)
   *
   * @param tableName - Name of the table
   * @param timestampColumn - Column to check for last update
   * @returns Table metadata
   */
  async getTableMetadata(
    tableName: string,
    timestampColumn: string = 'updated_at'
  ): Promise<{ rowCount: number; lastUpdate?: Date }> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      // Get row count
      const countReader = await this.connection.runAndReadAll(`SELECT COUNT(*) as count FROM ${tableName}`);
      const countRows = countReader.getRowObjects();
      const rowCount = countRows[0]?.count || 0;

      // Try to get last update from timestamp column
      let lastUpdate: Date | undefined;
      try {
        const timestampReader = await this.connection.runAndReadAll(`
          SELECT MAX(${timestampColumn}) as last_update
          FROM ${tableName}
          WHERE ${timestampColumn} IS NOT NULL
        `);
        const timestampRows = timestampReader.getRowObjects();
        const lastUpdateValue = timestampRows[0]?.last_update;
        if (lastUpdateValue) {
          lastUpdate = new Date(lastUpdateValue as string);
        }
      } catch {
        // Timestamp column might not exist, that's okay
        lastUpdate = undefined;
      }

      return {
        rowCount: Number(rowCount),
        lastUpdate,
      };
    } catch (error) {
      throw new Error(`Failed to get table metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a custom SQL query
   *
   * @param query - SQL query to execute
   * @returns Query result
   */
  async query<T = unknown>(query: string): Promise<T[]> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const reader = await this.connection.runAndReadAll(query);
      const rows = reader.getRowObjects();
      return rows as T[];
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    try {
      // Close connection and instance
      if (this.connection) {
        this.connection.closeSync();
        this.connection = null;
      }

      // Note: DuckDB instance should be closed automatically when connection closes
      // but we can explicitly set it to null for cleanup
      if (this.instance) {
        this.instance = null;
      }
    } catch (error) {
      // Log error but don't throw, as we want to clean up regardless
      console.warn(`Warning during DuckDB connection close: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Still reset the references
      this.connection = null;
      this.instance = null;
    }
  }
}
