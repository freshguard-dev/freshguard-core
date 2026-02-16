/**
 * Secure Azure SQL Database connector for FreshGuard Core
 * Extends BaseConnector with security built-in
 * Uses mssql driver with Azure-specific connection configuration
 *
 * @module @freshguard/freshguard-core/connectors/azure-sql
 */

import * as mssql from 'mssql';
import { BaseConnector } from './base-connector.js';
import type { ConnectorConfig, TableSchema, SecurityConfig } from '../types/connector.js';
import { type QueryResultRow, rowString } from '../types/driver-results.js';
import type { SourceCredentials } from '../types.js';
import {
  ConnectionError,
  TimeoutError,
  QueryError,
  ErrorHandler
} from '../errors/index.js';
import { validateConnectorConfig } from '../validators/index.js';

/**
 * Secure Azure SQL Database connector
 *
 * SSL is always enforced (Azure requirement).
 *
 * Features:
 * - SQL injection prevention
 * - Connection timeouts
 * - SSL always enforced (Azure requirement)
 * - Azure AD token-based authentication support
 * - Read-only query patterns
 * - Secure error handling
 *
 * @example
 * ```typescript
 * import { AzureSQLConnector } from '@freshguard/freshguard-core';
 *
 * const connector = new AzureSQLConnector({
 *   host: 'myserver.database.windows.net', port: 1433,
 *   database: 'analytics',
 *   username: 'readonly',
 *   password: process.env.AZURE_SQL_PASSWORD!,
 * });
 * ```
 */
export class AzureSQLConnector extends BaseConnector {
  private pool: mssql.ConnectionPool | null = null;
  private readonly schema: string;
  private connected = false;

  /**
   * @param config - Database connection settings (host, port, database, credentials).
   *   Pass `options.schema` to target a specific schema (default: `'dbo'`).
   * @param securityConfig - Optional overrides for query timeouts, max rows, and blocked keywords
   */
  constructor(config: ConnectorConfig, securityConfig?: Partial<SecurityConfig>) {
    // Validate configuration before proceeding
    validateConnectorConfig(config);
    super(config, securityConfig);

    this.schema = (config.options?.schema && typeof config.options.schema === 'string')
      ? config.options.schema
      : 'dbo';
  }

  /**
   * Connect to Azure SQL Database with security validation
   */
  private async connect(): Promise<void> {
    if (this.connected && this.pool) {
      return; // Already connected
    }

    try {
      const poolConfig: mssql.config = {
        server: this.config.host,
        port: this.config.port ?? 1433,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        options: {
          // Azure SQL always requires encryption
          encrypt: true,
          trustServerCertificate: false,
          connectTimeout: this.connectionTimeout,
          requestTimeout: this.queryTimeout,
          appName: this.config.applicationName ?? 'freshguard-core'
        },
        pool: {
          max: 1, // Single connection for monitoring
          min: 0,
          idleTimeoutMillis: 30000
        }
      };

      this.pool = new mssql.ConnectionPool(poolConfig);
      await this.pool.connect();

      this.connected = true;
    } catch (error) {
      throw new ConnectionError(
        'Failed to connect to Azure SQL Database',
        this.config.host,
        this.config.port,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute a validated SQL query with security measures
   */
  protected async executeQuery(sql: string): Promise<QueryResultRow[]> {
    return this.executeParameterizedQuery(sql, []);
  }

  /**
   * Execute a parameterized SQL query using prepared statements
   */
  protected async executeParameterizedQuery(sql: string, parameters: unknown[] = []): Promise<QueryResultRow[]> {
    await this.connect();

    if (!this.pool) {
      throw new ConnectionError('Database connection not available');
    }

    try {
      const result = await this.executeWithTimeout(
        async () => {
          if (!this.pool) throw new ConnectionError('Database connection not available');
          const request = this.pool.request();

          // Bind positional parameters as @p1, @p2, etc.
          for (let i = 0; i < parameters.length; i++) {
            request.input(`p${i + 1}`, parameters[i]);
          }

          // Replace $N placeholders with @pN for MSSQL
          let mssqlSql = sql;
          for (let i = parameters.length; i >= 1; i--) {
            mssqlSql = mssqlSql.replace(new RegExp(`\\$${i}`, 'g'), `@p${i}`);
          }
          // Also replace ? placeholders with @pN
          let paramIndex = 0;
          mssqlSql = mssqlSql.replace(/\?/g, () => `@p${++paramIndex}`);

          const res = await request.query(mssqlSql);
          return (res.recordset ?? []) as Record<string, unknown>[];
        },
        this.queryTimeout
      );

      // Validate result size for security
      this.validateResultSize(result);

      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error;
      }

      // Sanitize and re-throw as QueryError
      throw new QueryError(
        ErrorHandler.getUserMessage(error),
        'query_execution',
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Test database connection with security validation
   */
  async testConnection(debugConfig?: import('../types.js').DebugConfig): Promise<boolean> {
    const mergedDebugConfig = this.mergeDebugConfig(debugConfig);
    const debugId = `azuresql-test-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    const startTime = performance.now();

    try {
      this.logDebugInfo(mergedDebugConfig, debugId, 'Starting connection test', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        ssl: this.config.ssl
      });

      await this.connect();

      if (!this.pool) {
        this.logDebugError(mergedDebugConfig, debugId, 'Connection test', {
          error: 'Connection not available after connect',
          duration: performance.now() - startTime
        });
        return false;
      }

      // Test with a simple, safe query (skip validation for connection test)
      const sql = 'SELECT 1 AS test';

      await this.executeWithTimeout(
        async () => {
          if (!this.pool) throw new ConnectionError('Database connection not available');
          const request = this.pool.request();
          return request.query(sql);
        },
        this.connectionTimeout
      );

      const duration = performance.now() - startTime;

      if (mergedDebugConfig?.enabled) {
        console.log(`[DEBUG-${debugId}] Connection test completed:`, {
          success: true,
          duration,
          host: this.config.host,
          database: this.config.database
        });
      }

      return true;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.logDebugError(mergedDebugConfig, debugId, 'Connection test', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        error: mergedDebugConfig?.exposeRawErrors && error instanceof Error ? error.message : 'Connection failed',
        duration,
        suggestion: this.generateConnectionSuggestion(error)
      });

      // Don't throw - this method should return boolean
      return false;
    }
  }

  /**
   * Helper method to merge debug configuration
   */
  private mergeDebugConfig(debugConfig?: import('../types.js').DebugConfig): import('../types.js').DebugConfig {
    return {
      enabled: debugConfig?.enabled ?? (process.env.NODE_ENV === 'development'),
      exposeQueries: debugConfig?.exposeQueries ?? true,
      exposeRawErrors: debugConfig?.exposeRawErrors ?? true,
      logLevel: debugConfig?.logLevel ?? 'debug'
    };
  }

  /**
   * Generate connection suggestions based on error (Azure-specific)
   */
  private generateConnectionSuggestion(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Check database connection configuration';
    }

    const message = error.message.toLowerCase();

    if (message.includes('connect econnrefused') || message.includes('connection refused')) {
      return `Azure SQL Database at ${this.config.host}:${this.config.port} is not accepting connections. Verify the server name and check Azure SQL firewall rules.`;
    }

    if (message.includes('timeout') || message.includes('connect timeout')) {
      return `Connection timeout to ${this.config.host}:${this.config.port}. Check Azure SQL firewall rules, network connectivity, and ensure your IP is allowed.`;
    }

    if (message.includes('login failed') || message.includes('authentication failed')) {
      return `Authentication failed for database '${this.config.database}'. Verify username, password, and Azure AD configuration if using AAD auth.`;
    }

    if (message.includes('cannot open database') || (message.includes('database') && message.includes('not exist'))) {
      return `Database '${this.config.database}' not found. Check database name on your Azure SQL server.`;
    }

    if (message.includes('ssl') || message.includes('tls') || message.includes('encrypt')) {
      return `SSL/TLS connection issue. Azure SQL requires encryption - check SSL certificate configuration.`;
    }

    if (message.includes('firewall')) {
      return `Connection blocked by Azure SQL firewall. Add your client IP address to the server's firewall rules in the Azure portal.`;
    }

    if (message.includes('azure active directory') || message.includes('aad')) {
      return `Azure AD authentication issue. Verify Azure AD admin is configured and the user has proper permissions.`;
    }

    return `Connection failed to ${this.config.host}:${this.config.port}. Check host, port, credentials, firewall rules, and network connectivity.`;
  }

  /**
   * List all tables in the database
   */
  async listTables(): Promise<string[]> {
    const sql = `
      SELECT TABLE_NAME as table_name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_SCHEMA = $1
      ORDER BY TABLE_NAME
    `;

    await this.validateQuery(sql);

    try {
      const result = await this.executeParameterizedQuery(sql, [this.schema]);
      return result
        .slice(0, this.maxRows)
        .map((row) => rowString(row.table_name ?? row.TABLE_NAME ?? row.tablename))
        .filter(Boolean);
    } catch (error) {
      throw new QueryError(
        'Failed to list tables',
        'table_listing',
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get table schema information securely
   */
  async getTableSchema(table: string): Promise<TableSchema> {
    // Validate table name (identifiers cannot be parameterized)
    this.escapeIdentifier(table);

    const sql = `
      SELECT
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = $1
        AND TABLE_NAME = $2
      ORDER BY ORDINAL_POSITION
    `;

    await this.validateQuery(sql);

    try {
      const result = await this.executeParameterizedQuery(sql, [this.schema, table]);
      const limited = result.slice(0, this.maxRows);

      if (limited.length === 0) {
        throw QueryError.tableNotFound(table);
      }

      return {
        table,
        columns: limited.map(row => ({
          name: rowString(row.column_name ?? row.COLUMN_NAME),
          type: this.mapMSSQLType(rowString(row.data_type ?? row.DATA_TYPE)),
          nullable: (row.is_nullable ?? row.IS_NULLABLE) === 'YES'
        }))
      };
    } catch (error) {
      if (error instanceof QueryError) {
        throw error;
      }

      throw new QueryError(
        'Failed to get table schema',
        'schema_query',
        table,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get last modified timestamp using SQL Server-specific methods
   */
  async getLastModified(table: string): Promise<Date | null> {
    // Try common timestamp columns
    const timestampColumns = ['updated_at', 'modified_at', 'last_modified', 'timestamp'];

    for (const column of timestampColumns) {
      try {
        const result = await this.getMaxTimestamp(table, column);
        if (result) {
          return result;
        }
      } catch {
        // Column doesn't exist, try next one
        continue;
      }
    }

    // Fallback: use SQL Server DMV for index usage stats.
    // NOTE: sys.dm_db_index_usage_stats requires VIEW DATABASE STATE permission.
    // This is an OPTIONAL elevated privilege — if unavailable the connector
    // returns null. The minimum required permission is SELECT on monitored tables;
    // VIEW DATABASE STATE only improves getLastModified() accuracy.
    try {
      const sql = `
        SELECT MAX(last_user_update) as last_modified
        FROM sys.dm_db_index_usage_stats
        WHERE database_id = DB_ID()
          AND object_id = OBJECT_ID($1)
      `;

      await this.validateQuery(sql);
      const result = await this.executeParameterizedQuery(sql, [`${this.schema}.${table}`]);

      if (result.length > 0 && result[0]?.last_modified) {
        return new Date(rowString(result[0].last_modified));
      }
    } catch {
      // DMV query failed, return null
    }

    return null;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.close();
      } catch (error) {
        // Log error but don't throw - closing should be safe
        console.warn('Warning: Error closing Azure SQL connection:', ErrorHandler.getUserMessage(error));
      } finally {
        this.pool = null;
        this.connected = false;
      }
    }
  }

  /**
   * Map SQL Server/Azure SQL data types to standard types
   */
  private mapMSSQLType(mssqlType: string): string {
    const typeMap: Record<string, string> = {
      // Numeric types
      'tinyint': 'integer',
      'smallint': 'integer',
      'int': 'integer',
      'integer': 'integer',
      'bigint': 'bigint',
      'decimal': 'decimal',
      'numeric': 'decimal',
      'money': 'decimal',
      'smallmoney': 'decimal',
      'float': 'float',
      'real': 'float',
      'bit': 'boolean',

      // String types
      'char': 'text',
      'varchar': 'text',
      'text': 'text',
      'nchar': 'text',
      'nvarchar': 'text',
      'ntext': 'text',

      // Date/time types
      'date': 'date',
      'time': 'time',
      'datetime': 'timestamp',
      'datetime2': 'timestamp',
      'smalldatetime': 'timestamp',
      'datetimeoffset': 'timestamptz',

      // Binary types
      'binary': 'text',
      'varbinary': 'text',
      'image': 'text',

      // Special types
      'uniqueidentifier': 'text',
      'xml': 'text',
      'sql_variant': 'text',
      'hierarchyid': 'text',
      'geometry': 'text',
      'geography': 'text',
      'timestamp': 'text',
      'rowversion': 'text'
    };

    return typeMap[mssqlType.toLowerCase()] ?? 'unknown';
  }

  /**
   * Override escapeIdentifier for SQL Server bracket notation
   */
  protected escapeIdentifier(identifier: string): string {
    // Only allow alphanumeric, underscore, and dot (for schema.table)
    if (!/^[a-zA-Z0-9_.]+$/.test(identifier)) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }

    // Additional length check
    if (identifier.length > 256) {
      throw new Error('Identifier too long');
    }

    // Return with brackets for SQL Server
    return `[${identifier}]`;
  }

  // ==============================================
  // Legacy API compatibility methods
  // ==============================================

  /**
   * Legacy connect method for backward compatibility
   * @deprecated Use constructor with ConnectorConfig instead
   */
  async connectLegacy(credentials: SourceCredentials): Promise<void> {
    console.warn('Warning: connectLegacy is deprecated. Use constructor with ConnectorConfig instead.');

    // Convert legacy credentials to new format
    const config: ConnectorConfig = {
      host: credentials.host ?? '',
      port: credentials.port ?? 1433,
      database: credentials.database ?? '',
      username: credentials.username ?? '',
      password: credentials.password ?? '',
      ssl: credentials.sslMode !== 'disable'
    };

    // Validate and reconnect
    validateConnectorConfig(config);
    this.config = { ...this.config, ...config };
    await this.connect();
  }

  /**
   * Legacy test connection method for backward compatibility
   * @deprecated Use testConnection() instead
   */
  async testConnectionLegacy(): Promise<{ success: boolean; tableCount?: number; error?: string }> {
    console.warn('Warning: testConnectionLegacy is deprecated. Use testConnection() instead.');

    try {
      const success = await this.testConnection();

      if (success) {
        // Get table count for legacy compatibility
        const tables = await this.listTables();
        return {
          success: true,
          tableCount: tables.length
        };
      } else {
        return {
          success: false,
          error: 'Connection test failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: ErrorHandler.getUserMessage(error)
      };
    }
  }

  /**
   * Legacy get table metadata method for backward compatibility
   * @deprecated Use getRowCount() and getMaxTimestamp() instead
   */
  async getTableMetadata(
    tableName: string,
    timestampColumn = 'updated_at'
  ): Promise<{ rowCount: number; lastUpdate?: Date }> {
    console.warn('Warning: getTableMetadata is deprecated. Use getRowCount() and getMaxTimestamp() instead.');

    try {
      const rowCount = await this.getRowCount(tableName);
      const lastUpdate = await this.getMaxTimestamp(tableName, timestampColumn);

      return {
        rowCount,
        lastUpdate: lastUpdate ?? undefined
      };
    } catch (error) {
      throw new QueryError(
        'Failed to get table metadata',
        'metadata_query',
        tableName,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Legacy query method for backward compatibility
   * @deprecated Direct SQL queries are not allowed for security reasons
   */
  // eslint-disable-next-line @typescript-eslint/require-await -- deprecated stub that always throws
  async query<T = unknown>(_sql: string): Promise<T[]> {
    throw new Error(
      'Direct SQL queries are not allowed for security reasons. Use specific methods like getRowCount(), getMaxTimestamp(), etc.'
    );
  }
}
