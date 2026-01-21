/**
 * PostgreSQL connector
 * Handles connections to PostgreSQL databases
 *
 * @module @thias-se/freshguard-core/connectors/postgres
 */

import postgres from 'postgres';
import type { SourceCredentials } from '../types.js';

/**
 * PostgreSQL connector
 */
export class PostgresConnector {
  private client: ReturnType<typeof postgres> | null = null;

  /**
   * Connect to PostgreSQL database
   *
   * @param credentials - Connection credentials
   */
  async connect(credentials: SourceCredentials): Promise<void> {
    if (credentials.connectionString) {
      this.client = postgres(credentials.connectionString);
    } else {
      const { host, port, database, username, password, sslMode } = credentials;

      if (!host || !database || !username) {
        throw new Error('Missing required PostgreSQL credentials (host, database, username)');
      }

      const sslConfig = sslMode === 'disable' ? false :
                        sslMode === 'verify-ca' ? 'require' : // Map verify-ca to require
                        (sslMode as 'require' | 'prefer' | 'verify-full') || 'prefer';

      this.client = postgres({
        host,
        port: port || 5432,
        database,
        username,
        password,
        ssl: sslConfig,
      });
    }
  }

  /**
   * Test connection by executing a simple query
   *
   * @returns True if connection is successful
   */
  async testConnection(): Promise<{ success: boolean; tableCount?: number; error?: string }> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      // Test connection with simple query
      await this.client`SELECT 1 as test`;

      // Get table count
      const tableCountResult = await this.client`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `;

      const tableCount = parseInt(tableCountResult[0]?.count || '0', 10);

      return {
        success: true,
        tableCount,
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
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const result = await this.client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    return result.map((row: any) => row.table_name);
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
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const result = await this.client`
      SELECT
        COUNT(*) as row_count,
        MAX(${this.client(timestampColumn)}) as last_update
      FROM ${this.client(tableName)}
    `;

    return {
      rowCount: parseInt(result[0]?.row_count || '0', 10),
      lastUpdate: result[0]?.last_update || undefined,
    };
  }

  /**
   * Execute a custom SQL query
   *
   * @param query - SQL query to execute
   * @returns Query result
   */
  async query<T = unknown>(query: string): Promise<T[]> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    return this.client.unsafe(query) as Promise<T[]>;
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}
