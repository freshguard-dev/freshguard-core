/**
 * Secure Azure Synapse Analytics connector for FreshGuard Core
 * Extends BaseConnector with security built-in
 * Uses mssql driver with Synapse-specific configuration
 *
 * @module @freshguard/freshguard-core/connectors/synapse
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
 * Secure Azure Synapse Analytics connector
 *
 * SSL is always enforced (Azure requirement). Includes Synapse-specific DMV
 * support for `dm_pdw_exec_requests`.
 *
 * Features:
 * - SQL injection prevention
 * - Connection timeouts
 * - SSL always enforced (Azure requirement)
 * - Read-only query patterns
 * - Secure error handling
 * - Synapse-specific DMV support (dm_pdw_exec_requests)
 *
 * @example
 * ```typescript
 * import { SynapseConnector } from '@freshguard/freshguard-core';
 *
 * // Username/password auth
 * const connector = new SynapseConnector({
 *   host: 'myworkspace.sql.azuresynapse.net', port: 1433,
 *   database: 'analytics_pool',
 *   username: 'readonly',
 *   password: process.env.SYNAPSE_PASSWORD!,
 * });
 *
 * // Entra Service Principal auth
 * const spConnector = new SynapseConnector({
 *   host: 'myworkspace.sql.azuresynapse.net', port: 1433,
 *   database: 'analytics_pool',
 *   username: '', password: '', ssl: true,
 *   options: {
 *     authentication: {
 *       type: 'azure-active-directory-service-principal-secret',
 *       options: { tenantId: '...', clientId: '...', clientSecret: '...' },
 *     },
 *   },
 * });
 * ```
 */
export class SynapseConnector extends BaseConnector {
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
   * Connect to Azure Synapse Analytics with security validation
   */
  private async connect(): Promise<void> {
    if (this.connected && this.pool) {
      return; // Already connected
    }

    try {
      const altAuth = (this.config.options?.authentication &&
        typeof this.config.options.authentication === 'object')
        ? this.config.options.authentication as mssql.config['authentication']
        : undefined;

      const poolConfig: mssql.config = {
        server: this.config.host,
        port: this.config.port ?? 1433,
        database: this.config.database,
        // Credentials: mutually exclusive with authentication block
        ...(altAuth
          ? { authentication: altAuth }
          : { user: this.config.username, password: this.config.password }),
        options: {
          // Azure Synapse always requires encryption
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
        'Failed to connect to Azure Synapse Analytics',
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
    const debugId = `synapse-test-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
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
   * Generate connection suggestions based on error (Synapse-specific)
   */
  private generateConnectionSuggestion(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Check database connection configuration';
    }

    const message = error.message.toLowerCase();

    if (message.includes('connect econnrefused') || message.includes('connection refused')) {
      return `Azure Synapse at ${this.config.host}:${this.config.port} is not accepting connections. Verify the SQL pool is running and check firewall rules.`;
    }

    if (message.includes('timeout') || message.includes('connect timeout')) {
      return `Connection timeout to ${this.config.host}:${this.config.port}. The SQL pool may be paused or scaling. Check pool status and firewall rules.`;
    }

    if (message.includes('login failed') || message.includes('authentication failed')) {
      return `Authentication failed for database '${this.config.database}'. Verify username, password, and Azure AD configuration if using AAD auth.`;
    }

    if (message.includes('cannot open database') || (message.includes('database') && message.includes('not exist'))) {
      return `Database '${this.config.database}' not found. Check database name on your Azure Synapse workspace.`;
    }

    if (message.includes('ssl') || message.includes('tls') || message.includes('encrypt')) {
      return `SSL/TLS connection issue. Azure Synapse requires encryption - check SSL certificate configuration.`;
    }

    if (message.includes('firewall')) {
      return `Connection blocked by firewall. Add your client IP address to the Synapse workspace firewall rules.`;
    }

    if (message.includes('paused') || message.includes('suspended') || message.includes('resuming')) {
      return `SQL pool appears to be paused or resuming. Resume the dedicated SQL pool in the Azure portal and wait for it to become available.`;
    }

    if (message.includes('dwu') || message.includes('capacity')) {
      return `SQL pool capacity issue. Check DWU settings and consider scaling up your dedicated SQL pool.`;
    }

    return `Connection failed to ${this.config.host}:${this.config.port}. Check host, port, credentials, SQL pool status, and network connectivity.`;
  }

  /**
   * List all tables in the database (including external tables)
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
          type: this.mapSynapseType(rowString(row.data_type ?? row.DATA_TYPE)),
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
   * Get last modified timestamp using Synapse-specific methods
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

    // Fallback: use Synapse DMV for recent requests against this table.
    // NOTE: sys.dm_pdw_exec_requests requires VIEW DATABASE STATE permission.
    // This is an OPTIONAL elevated privilege — if unavailable the connector
    // returns null. Be aware that this DMV exposes query text from ALL users
    // in the warehouse, so granting VIEW DATABASE STATE has broader
    // information-disclosure implications than the other permissions
    // FreshGuard requires. The minimum required permission is SELECT on
    // monitored tables; this DMV fallback only provides approximate
    // last-modified timestamps.
    try {
      this.escapeIdentifier(table);
      const sql = `
        SELECT MAX(end_time) as last_modified
        FROM sys.dm_pdw_exec_requests
        WHERE command LIKE $1
          AND status = 'Completed'
          AND resource_class IS NOT NULL
      `;

      await this.validateQuery(sql);
      const result = await this.executeParameterizedQuery(sql, [`%${table}%`]);

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
        console.warn('Warning: Error closing Synapse connection:', ErrorHandler.getUserMessage(error));
      } finally {
        this.pool = null;
        this.connected = false;
      }
    }
  }

  /**
   * Map Synapse data types to standard types
   * Includes Synapse-specific types alongside standard SQL Server types
   */
  private mapSynapseType(synapseType: string): string {
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

    return typeMap[synapseType.toLowerCase()] ?? 'unknown';
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
