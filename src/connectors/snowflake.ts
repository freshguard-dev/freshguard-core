/**
 * Snowflake connector
 * Handles connections to Snowflake data warehouse
 *
 * @module @thias-se/freshguard-core/connectors/snowflake
 */

import * as snowflake from 'snowflake-sdk';
import type { SourceCredentials } from '../types.js';

/**
 * Snowflake connector
 * Connects to Snowflake data warehouse using username/password or other auth methods
 */
export class SnowflakeConnector {
  private connection: snowflake.Connection | null = null;
  private database: string = '';
  private schema: string = '';

  /**
   * Connect to Snowflake
   *
   * @param credentials - Connection credentials
   */
  async connect(credentials: SourceCredentials): Promise<void> {
    const options = credentials.additionalOptions || {};

    // Extract required connection parameters
    if (!credentials.host || !credentials.username || !credentials.password) {
      throw new Error('Missing required Snowflake credentials (host, username, password)');
    }

    // Extract account from host or additional options
    let account = options.account as string;
    if (!account) {
      // Try to extract account from host (e.g., myaccount.snowflakecomputing.com -> myaccount)
      if (credentials.host) {
        const hostMatch = credentials.host.match(/^([^.]+)\.snowflakecomputing\.com$/);
        if (hostMatch && hostMatch[1]) {
          account = hostMatch[1];
        } else {
          throw new Error('Could not determine Snowflake account. Provide in additionalOptions.account or use format: account.snowflakecomputing.com for host');
        }
      } else {
        throw new Error('Could not determine Snowflake account. Provide in additionalOptions.account or use format: account.snowflakecomputing.com for host');
      }
    }

    // Set database and schema for later use
    this.database = credentials.database || (options.database as string) || '';
    this.schema = (options.schema as string) || 'PUBLIC';

    try {
      const connectionOptions: snowflake.ConnectionOptions = {
        account,
        username: credentials.username,
        password: credentials.password,
        database: this.database,
        schema: this.schema,
        warehouse: (options.warehouse as string) || undefined,
        role: (options.role as string) || undefined,
        authenticator: (options.authenticator as string) || 'SNOWFLAKE',
        timeout: 30000, // 30 second timeout
      };

      // Create connection and connect
      this.connection = snowflake.createConnection(connectionOptions);

      // Connect using promises
      await new Promise<void>((resolve, reject) => {
        this.connection!.connect((err) => {
          if (err) {
            reject(new Error(`Failed to connect to Snowflake: ${err.message}`));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to connect to Snowflake: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      await this.executeQuery('SELECT 1 as test');

      // Get table count for current database/schema
      let tableCountQuery = `
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES
        WHERE table_schema = '${this.schema.toUpperCase()}'
      `;

      // If no database is specified, count all tables the user has access to
      if (!this.database) {
        tableCountQuery = `
          SELECT COUNT(*) as count
          FROM INFORMATION_SCHEMA.TABLES
        `;
      }

      const tableCountResult = await this.executeQuery(tableCountQuery);
      const tableCount = parseInt(tableCountResult[0]?.COUNT || '0', 10);

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
   * List all tables in the database/schema
   *
   * @returns Array of table names
   */
  async listTables(): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      let query = `
        SELECT table_name
        FROM INFORMATION_SCHEMA.TABLES
        WHERE table_schema = '${this.schema.toUpperCase()}'
        ORDER BY table_name
      `;

      // If no database is specified, get tables from all schemas
      if (!this.database) {
        query = `
          SELECT CONCAT(table_schema, '.', table_name) as table_name
          FROM INFORMATION_SCHEMA.TABLES
          ORDER BY table_schema, table_name
        `;
      }

      const result = await this.executeQuery(query);
      return result.map((row: any) => row.TABLE_NAME || row.table_name);
    } catch (error) {
      throw new Error(`Failed to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get table metadata (row count, last update)
   *
   * @param tableName - Name of the table (can be just table or schema.table or database.schema.table)
   * @param timestampColumn - Column to check for last update
   * @returns Table metadata
   */
  async getTableMetadata(
    tableName: string,
    timestampColumn: string = 'UPDATED_AT'
  ): Promise<{ rowCount: number; lastUpdate?: Date }> {
    if (!this.connection) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      // Parse and qualify table name
      const fullTableName = this.parseTableName(tableName);

      // Get row count and last update time
      const query = `
        SELECT
          COUNT(*) as row_count,
          MAX(${timestampColumn}) as last_update
        FROM ${fullTableName}
      `;

      const result = await this.executeQuery(query);
      const row = result[0];

      return {
        rowCount: parseInt(row?.ROW_COUNT || '0', 10),
        lastUpdate: row?.LAST_UPDATE ? new Date(row.LAST_UPDATE) : undefined,
      };
    } catch (error) {
      // If the timestamp column doesn't exist, try to get just the row count
      try {
        const fullTableName = this.parseTableName(tableName);
        const countQuery = `SELECT COUNT(*) as row_count FROM ${fullTableName}`;
        const result = await this.executeQuery(countQuery);

        return {
          rowCount: parseInt(result[0]?.ROW_COUNT || '0', 10),
          lastUpdate: undefined,
        };
      } catch {
        throw new Error(`Failed to get table metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
      return await this.executeQuery(query) as T[];
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.connection) {
      try {
        await new Promise<void>((resolve) => {
          this.connection!.destroy((err) => {
            if (err) {
              console.warn(`Warning during Snowflake connection close: ${err.message}`);
            }
            resolve();
          });
        });
      } catch (error) {
        console.warn(`Warning during Snowflake connection close: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        this.connection = null;
        this.database = '';
        this.schema = '';
      }
    }
  }

  /**
   * Execute a SQL query using the Snowflake connection
   *
   * @private
   * @param query - SQL query to execute
   * @returns Promise resolving to query results
   */
  private async executeQuery(query: string): Promise<any[]> {
    if (!this.connection) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      this.connection!.execute({
        sqlText: query,
        complete: (err, _stmt, rows) => {
          if (err) {
            reject(new Error(`Query execution failed: ${err.message}`));
          } else {
            resolve(rows || []);
          }
        }
      });
    });
  }

  /**
   * Parse table name to ensure proper qualification
   *
   * @private
   * @param tableName - Input table name
   * @returns Fully qualified table name
   */
  private parseTableName(tableName: string): string {
    const parts = tableName.split('.');

    if (parts.length === 3) {
      // Already fully qualified: database.schema.table
      return tableName.toUpperCase();
    } else if (parts.length === 2) {
      // schema.table format
      if (this.database) {
        return `${this.database}.${tableName}`.toUpperCase();
      } else {
        return tableName.toUpperCase();
      }
    } else if (parts.length === 1) {
      // Just table name
      if (this.database && this.schema) {
        return `${this.database}.${this.schema}.${tableName}`.toUpperCase();
      } else if (this.schema) {
        return `${this.schema}.${tableName}`.toUpperCase();
      } else {
        return tableName.toUpperCase();
      }
    } else {
      throw new Error(`Invalid table name format: '${tableName}'. Expected: table, schema.table, or database.schema.table`);
    }
  }
}