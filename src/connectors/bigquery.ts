/**
 * BigQuery connector
 * Handles connections to Google BigQuery data warehouse
 *
 * @module @thias-se/freshguard-core/connectors/bigquery
 */

import { BigQuery } from '@google-cloud/bigquery';
import type { SourceCredentials } from '../types.js';

/**
 * BigQuery connector
 * Connects to Google BigQuery using service account or application default credentials
 */
export class BigQueryConnector {
  private client: BigQuery | null = null;
  private projectId: string = '';

  /**
   * Connect to BigQuery
   *
   * @param credentials - Connection credentials
   */
  async connect(credentials: SourceCredentials): Promise<void> {
    const options = credentials.additionalOptions || {};

    // Extract project ID from credentials or additional options
    this.projectId = (options.projectId as string) || credentials.database || '';

    if (!this.projectId) {
      throw new Error('Missing required BigQuery project ID (provide in additionalOptions.projectId or database field)');
    }

    try {
      const bigqueryOptions: any = {
        projectId: this.projectId,
      };

      // Handle different authentication methods
      if (options.keyFilename) {
        bigqueryOptions.keyFilename = options.keyFilename as string;
      } else if (options.credentials) {
        bigqueryOptions.credentials = options.credentials;
      } else if (options.useApplicationDefault) {
        // Use Application Default Credentials - no additional config needed
      } else if (credentials.password) {
        // Treat password as service account JSON string
        try {
          bigqueryOptions.credentials = JSON.parse(credentials.password);
        } catch (error) {
          throw new Error('Invalid service account JSON in password field');
        }
      }

      // Set location if provided
      if (options.location) {
        bigqueryOptions.location = options.location as string;
      }

      this.client = new BigQuery(bigqueryOptions);

      // Test authentication by listing one dataset
      await this.client.getDatasets({ maxResults: 1 });
    } catch (error) {
      throw new Error(`Failed to connect to BigQuery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test connection by executing a simple query
   *
   * @returns Connection test result
   */
  async testConnection(): Promise<{ success: boolean; tableCount?: number; error?: string }> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      // Test connection with a simple query
      const query = 'SELECT 1 as test';
      await this.client.query({ query });

      // Get table count across all datasets in the project
      const tableCountQuery = `
        SELECT COUNT(*) as count
        FROM \`${this.projectId}.INFORMATION_SCHEMA.TABLES\`
        WHERE table_type = 'BASE_TABLE'
      `;

      const [rows] = await this.client.query({ query: tableCountQuery });
      const tableCount = parseInt(rows[0]?.count || '0', 10);

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
   * List all tables in the project
   *
   * @returns Array of table names in format: dataset.table
   */
  async listTables(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const query = `
        SELECT
          CONCAT(table_schema, '.', table_name) as table_name
        FROM \`${this.projectId}.INFORMATION_SCHEMA.TABLES\`
        WHERE table_type = 'BASE_TABLE'
        ORDER BY table_schema, table_name
      `;

      const [rows] = await this.client.query({ query });
      return rows.map((row: any) => row.table_name);
    } catch (error) {
      throw new Error(`Failed to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get table metadata (row count, last update)
   *
   * @param tableName - Name of the table (format: dataset.table or project.dataset.table)
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

    try {
      // Parse table name to handle different formats
      const fullTableName = this.parseTableName(tableName);

      // Get row count and last update time
      const query = `
        SELECT
          COUNT(*) as row_count,
          MAX(${timestampColumn}) as last_update
        FROM \`${fullTableName}\`
      `;

      const [rows] = await this.client.query({ query });
      const result = rows[0];

      return {
        rowCount: parseInt(result?.row_count || '0', 10),
        lastUpdate: result?.last_update ? new Date(result.last_update) : undefined,
      };
    } catch (error) {
      // If the timestamp column doesn't exist, try to get just the row count
      try {
        const fullTableName = this.parseTableName(tableName);
        const countQuery = `SELECT COUNT(*) as row_count FROM \`${fullTableName}\``;
        const [rows] = await this.client.query({ query: countQuery });

        return {
          rowCount: parseInt(rows[0]?.row_count || '0', 10),
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
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const [rows] = await this.client.query({ query });
      return rows as T[];
    } catch (error) {
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    // BigQuery client doesn't require explicit connection closing
    // Just reset the client reference
    this.client = null;
    this.projectId = '';
  }

  /**
   * Parse table name to ensure proper project.dataset.table format
   *
   * @private
   * @param tableName - Input table name
   * @returns Fully qualified table name
   */
  private parseTableName(tableName: string): string {
    const parts = tableName.split('.');

    if (parts.length === 3) {
      // Already fully qualified: project.dataset.table
      return tableName;
    } else if (parts.length === 2) {
      // dataset.table format - prepend project
      return `${this.projectId}.${tableName}`;
    } else if (parts.length === 1) {
      // Just table name - need to handle this case
      throw new Error(`Table name '${tableName}' must include dataset (format: dataset.table)`);
    } else {
      throw new Error(`Invalid table name format: '${tableName}'. Expected: dataset.table or project.dataset.table`);
    }
  }
}