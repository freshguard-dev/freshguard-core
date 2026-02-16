/**
 * Secure BigQuery connector for FreshGuard Core
 * Extends BaseConnector with security built-in
 *
 * @module @freshguard/freshguard-core/connectors/bigquery
 */

import { BigQuery } from '@google-cloud/bigquery';
import { BaseConnector } from './base-connector.js';
import type { ConnectorConfig, TableSchema, SecurityConfig } from '../types/connector.js';
import { type QueryResultRow, rowString } from '../types/driver-results.js';
import type { SourceCredentials } from '../types.js';
import {
  ConnectionError,
  TimeoutError,
  QueryError,
  ConfigurationError,
  SecurityError,
  ErrorHandler
} from '../errors/index.js';
import { validateDatabaseIdentifier, validateTableName } from '../validators/index.js';

/**
 * Secure BigQuery connector
 *
 * Connects to Google BigQuery using Application Default Credentials or a
 * service-account key. The `database` field in the config is the GCP project ID.
 *
 * Features:
 * - SQL injection prevention
 * - Credential validation
 * - Read-only query patterns
 * - Connection timeouts
 * - Secure error handling
 *
 * @example
 * ```typescript
 * import { BigQueryConnector } from '@freshguard/freshguard-core';
 *
 * const connector = new BigQueryConnector({
 *   host: 'bigquery.googleapis.com', port: 443,
 *   database: 'my-gcp-project',
 *   username: 'service-account@project.iam.gserviceaccount.com',
 *   password: process.env.BQ_KEY!,
 * });
 * ```
 */
export class BigQueryConnector extends BaseConnector {
  private client: BigQuery | null = null;
  private projectId = '';
  private location = 'US';
  private locationExplicitlySet = false;
  private dataset: string | undefined;
  private connected = false;

  /**
   * @param config - Connection config; `database` is the GCP project ID.
   *   Pass `options.location` (e.g. `'EU'`, `'us-central1'`) to target a
   *   specific BigQuery region.  When omitted, the location is auto-detected
   *   from the first accessible dataset; if no datasets exist the default
   *   `'US'` is used for backward compatibility.
   * @param securityConfig - Optional overrides for query timeouts, max rows, and blocked keywords
   */
  constructor(config: ConnectorConfig, securityConfig?: Partial<SecurityConfig>) {
    // Validate BigQuery-specific configuration
    BigQueryConnector.validateBigQueryConfig(config);
    super(config, securityConfig);

    // For BigQuery, database field contains the project ID
    this.projectId = config.database;

    // Accept location from config options
    if (config.options?.location && typeof config.options.location === 'string') {
      this.location = config.options.location;
      this.locationExplicitlySet = true;
    }

    // Accept dataset from config options
    if (config.options?.dataset && typeof config.options.dataset === 'string') {
      validateTableName(config.options.dataset);
      this.dataset = config.options.dataset;
    }
  }

  /**
   * Validate BigQuery-specific configuration
   */
  private static validateBigQueryConfig(config: ConnectorConfig): void {
    if (!config.database) {
      throw new ConfigurationError('Project ID is required for BigQuery (use database field)');
    }

    // Validate project ID format (Google Cloud project IDs have specific rules)
    const projectIdPattern = /^[a-z][a-z0-9-]*[a-z0-9]$/;
    if (!projectIdPattern.test(config.database)) {
      throw new ConfigurationError('Invalid BigQuery project ID format');
    }

    // BigQuery uses service account authentication, not traditional username/password
    // But we still require them for consistency with the interface
    if (!config.password && !config.username) {
      throw new ConfigurationError('Service account credentials required for BigQuery');
    }

    // Validate service account credentials if provided
    if (config.password) {
      try {
        // Parse service account JSON from password field
        const credentials = JSON.parse(config.password) as Record<string, unknown>;

        // Validate that this looks like a service account key
        if (!credentials.type || credentials.type !== 'service_account') {
          throw new SecurityError('Invalid service account credentials format');
        }

        if (!credentials.project_id || credentials.project_id !== config.database) {
          throw new SecurityError('Service account project ID does not match specified project');
        }
      } catch (error) {
        if (error instanceof SecurityError) {
          throw error;
        }
        throw new ConfigurationError('Invalid service account JSON in password field');
      }
    }
  }

  /**
   * Connect to BigQuery with security validation
   */
  private async connect(): Promise<void> {
    if (this.connected && this.client) {
      return; // Already connected
    }

    try {
      const bigqueryOptions: Record<string, unknown> = {
        projectId: this.projectId,
        location: this.location,
        // Timeout for BigQuery operations
        queryTimeoutMs: this.queryTimeout,
      };

      // Handle authentication - prioritize service account key
      if (this.config.password) {
        // Service account validation was already done in constructor
        const credentials = JSON.parse(this.config.password) as Record<string, unknown>;
        bigqueryOptions.credentials = credentials;
      } else {
        // Fallback to Application Default Credentials
        console.warn('No service account provided, using Application Default Credentials');
      }

      // Create BigQuery client with timeout protection
      this.client = await this.executeWithTimeout(
        () => new Promise<BigQuery>((resolvePromise) => {
          const client = new BigQuery(bigqueryOptions as ConstructorParameters<typeof BigQuery>[0]);
          resolvePromise(client);
        }),
        this.connectionTimeout
      );

      // Test authentication by listing datasets (limited)
      // Also auto-detect location from the first dataset when not explicitly configured
      const datasetsResponse = await this.executeWithTimeout(
        () => {
          if (!this.client) throw new ConnectionError('BigQuery client not available');
          return this.client.getDatasets({ maxResults: 1 });
        },
        this.connectionTimeout
      );

      const datasets = (datasetsResponse as unknown[])[0] as { getMetadata: () => Promise<[Record<string, unknown>]> }[] | undefined;

      const firstDataset = datasets?.[0];
      if (!this.locationExplicitlySet && firstDataset) {
        try {
          const [metadata] = await firstDataset.getMetadata();
          if (metadata.location && typeof metadata.location === 'string') {
            this.location = metadata.location;
          }
        } catch {
          // Auto-detection failed; keep default 'US'
        }
      }

      this.connected = true;
    } catch (error) {
      if (error instanceof TimeoutError || error instanceof SecurityError) {
        throw error;
      }

      throw new ConnectionError(
        'Failed to connect to BigQuery',
        'bigquery.googleapis.com',
        443,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute a parameterized SQL query using BigQuery's named parameters
   */
  protected async executeParameterizedQuery(sql: string, parameters: unknown[] = []): Promise<QueryResultRow[]> {
    await this.connect();

    if (!this.client) {
      throw new ConnectionError('BigQuery client not available');
    }

    try {
      // Convert positional parameters ($1, $2, etc.) to BigQuery named parameters (@param1, @param2, etc.)
      let finalSql = sql;
      const namedParams: Record<string, unknown> = {};

      if (parameters.length > 0) {
        for (let i = 0; i < parameters.length; i++) {
          const placeholder = `$${i + 1}`;
          const namedParam = `param${i + 1}`;

          // Replace $1, $2, etc. with @param1, @param2, etc.
          // eslint-disable-next-line security/detect-non-literal-regexp
          finalSql = finalSql.replace(new RegExp(`\\${placeholder}\\b`, 'g'), `@${namedParam}`);
          namedParams[namedParam] = parameters[i];
        }
      }

      const queryOptions: Record<string, unknown> = {
        query: finalSql,
        location: this.location,
        maxResults: this.maxRows,
        jobTimeoutMs: this.queryTimeout,
        useLegacySql: false, // Force standard SQL for security
      };

      // Add named parameters if any exist
      if (Object.keys(namedParams).length > 0) {
        queryOptions.params = namedParams;
      }

      const [rows] = await this.executeWithTimeout(
        () => {
          if (!this.client) throw new ConnectionError('BigQuery client not available');
          return this.client.query(queryOptions as Parameters<BigQuery['query']>[0]);
        },
        this.queryTimeout
      );

      const typedRows = rows as QueryResultRow[];

      // Validate result size for security
      this.validateResultSize(typedRows);

      return typedRows;
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
   * Execute a validated SQL query with security measures
   */
  protected async executeQuery(sql: string): Promise<QueryResultRow[]> {
    return this.executeParameterizedQuery(sql, []);
  }

  /**
   * Test database connection with security validation
   */
  async testConnection(debugConfig?: import('../types.js').DebugConfig): Promise<boolean> {
    const mergedDebugConfig = this.mergeDebugConfig(debugConfig);
    const debugId = `bq-test-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    const startTime = performance.now();

    try {
      this.logDebugInfo(mergedDebugConfig, debugId, 'Starting BigQuery connection test', {
        projectId: this.projectId,
        location: this.location
      });

      await this.connect();

      if (!this.client) {
        this.logDebugError(mergedDebugConfig, debugId, 'BigQuery connection test', {
          error: 'Client not available after connect',
          duration: performance.now() - startTime
        });
        return false;
      }

      // Test with a simple, safe query (skip validation for connection test)
      const sql = 'SELECT 1 as test';

      await this.executeWithTimeout(
        () => {
          if (!this.client) throw new ConnectionError('BigQuery client not available');
          return this.client.query({ query: sql, location: this.location });
        },
        this.connectionTimeout
      );

      const duration = performance.now() - startTime;

      if (mergedDebugConfig?.enabled) {
        console.log(`[DEBUG-${debugId}] BigQuery connection test completed:`, {
          success: true,
          duration,
          projectId: this.projectId,
          location: this.location
        });
      }

      return true;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.logDebugError(mergedDebugConfig, debugId, 'BigQuery connection test', {
        projectId: this.projectId,
        location: this.location,
        error: mergedDebugConfig?.exposeRawErrors && error instanceof Error ? error.message : 'Connection failed',
        duration,
        suggestion: this.generateBigQueryConnectionSuggestion(error)
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
   * Generate BigQuery-specific connection suggestions based on error
   */
  private generateBigQueryConnectionSuggestion(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Check BigQuery project configuration and permissions';
    }

    const message = error.message.toLowerCase();

    if (message.includes('project not found') || message.includes('invalid project')) {
      return `Project '${this.projectId}' not found or inaccessible. Verify project ID and ensure proper access permissions.`;
    }

    if (message.includes('permission denied') || message.includes('access denied')) {
      return `Permission denied for project '${this.projectId}'. Ensure service account has BigQuery Data Viewer or Editor role.`;
    }

    if (message.includes('authentication') || message.includes('credentials')) {
      return `Authentication failed. Check service account key file or default application credentials (gcloud auth).`;
    }

    if (message.includes('quota') || message.includes('limit')) {
      return `BigQuery quota exceeded for project '${this.projectId}'. Check project quotas in GCP Console.`;
    }

    if (message.includes('dataset') && message.includes('not found')) {
      return `Dataset not found in project '${this.projectId}'. Verify dataset name and location are correct.`;
    }

    if (message.includes('location') || message.includes('region')) {
      return `Location/region issue. Ensure dataset location '${this.location}' is correct and accessible.`;
    }

    if (message.includes('billing')) {
      return `Billing not enabled for project '${this.projectId}'. Enable billing in GCP Console to use BigQuery.`;
    }

    return `BigQuery connection failed for project '${this.projectId}'. Check project ID, credentials, and billing status.`;
  }

  /**
   * List all tables in the project, or in a single dataset when one is set.
   *
   * When a dataset is configured (via `options.dataset` or {@link setDataset}),
   * the query targets `{project}.{dataset}.INFORMATION_SCHEMA.TABLES` which
   * only requires dataset-level permissions.  Without a dataset the query
   * targets `{project}.INFORMATION_SCHEMA.TABLES` (project-wide).
   */
  async listTables(): Promise<string[]> {
    // Interpolate projectId (and dataset) directly — they are validated in the
    // constructor / setDataset(), and BigQuery does not support parameterized
    // identifiers inside backtick-quoted references.
    const source = this.dataset
      ? `\`${this.projectId}.${this.dataset}.INFORMATION_SCHEMA.TABLES\``
      : `\`${this.projectId}.INFORMATION_SCHEMA.TABLES\``;

    const sql = this.dataset
      ? `
      SELECT
        CONCAT('${this.dataset}', '.', table_name) as table_name
      FROM ${source}
      WHERE table_type = 'BASE TABLE'
      ORDER BY table_name
      LIMIT $1
    `
      : `
      SELECT
        CONCAT(table_schema, '.', table_name) as table_name
      FROM ${source}
      WHERE table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name
      LIMIT $1
    `;

    await this.validateQuery(sql);

    try {
      const result = await this.executeParameterizedQuery(sql, [this.maxRows]);
      return result.map((row) => String((row.table_name ?? row.TABLE_NAME ?? row.tablename ?? '') as string)).filter(Boolean);
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
    const parsedTable = this.parseTableName(table);
    const tableParts = parsedTable.split('.');

    // Ensure we have exactly 3 parts: project.dataset.table
    if (tableParts.length !== 3) {
      throw new QueryError('Invalid table name format. Expected: project.dataset.table', 'invalid_table_name');
    }

    const [projectId, datasetId, tableName] = tableParts;

    // Interpolate projectId and datasetId directly — they are validated via
    // parseTableName() / validateDatabaseIdentifier(), and BigQuery does not
    // support parameterized identifiers inside backtick-quoted references.
    const sql = `
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM \`${projectId}.${datasetId}.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name = $1
      ORDER BY ordinal_position
      LIMIT $2
    `;

    await this.validateQuery(sql);

    try {
      const result = await this.executeParameterizedQuery(sql, [tableName, this.maxRows]);

      if (result.length === 0) {
        throw QueryError.tableNotFound(table);
      }

      return {
        table,
        columns: result.map(row => ({
          name: String((row.column_name ?? row.COLUMN_NAME ?? '') as string),
          type: this.mapBigQueryType(String((row.data_type ?? row.DATA_TYPE ?? '') as string)),
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
   * Get last modified timestamp for BigQuery tables
   * Uses BigQuery's table metadata when possible
   */
  async getLastModified(table: string): Promise<Date | null> {
    const parsedTable = this.parseTableName(table);

    try {
      // First try to get table metadata from BigQuery API
      const [dataset, tableId] = parsedTable.split('.').slice(-2);

      if (this.client && dataset && tableId) {
        const tableRef = this.client.dataset(dataset).table(tableId);
        const [metadata] = await tableRef.getMetadata() as unknown as [Record<string, unknown>];

        const lastModifiedTime = metadata.lastModifiedTime;
        if (lastModifiedTime) {
          return new Date(parseInt(rowString(lastModifiedTime), 10));
        }
      }
    } catch {
      // Fallback to SQL-based approach
    }

    // Try common timestamp columns
    const timestampColumns = ['updated_at', 'modified_at', 'last_modified', 'timestamp', '_airbyte_extracted_at'];

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

    return null;
  }

  /**
   * Close the BigQuery connection
   */
  close(): Promise<void> {
    try {
      // BigQuery client doesn't require explicit cleanup
      // Just reset references
      this.client = null;
      this.connected = false;
    } catch (error) {
      // Log error but don't throw
      console.warn('Warning: Error closing BigQuery connection:', ErrorHandler.getUserMessage(error));
    }
    return Promise.resolve();
  }

  /**
   * Map BigQuery data types to standard types
   */
  private mapBigQueryType(bqType: string): string {
    const typeMap: Record<string, string> = {
      'STRING': 'text',
      'BYTES': 'binary',
      'INTEGER': 'bigint',
      'INT64': 'bigint',
      'FLOAT': 'float',
      'FLOAT64': 'float',
      'NUMERIC': 'decimal',
      'DECIMAL': 'decimal',
      'BIGNUMERIC': 'decimal',
      'BOOLEAN': 'boolean',
      'TIMESTAMP': 'timestamptz',
      'DATE': 'date',
      'TIME': 'time',
      'DATETIME': 'timestamp',
      'JSON': 'json',
      'ARRAY': 'array',
      'STRUCT': 'object',
      'RECORD': 'object',
      'GEOGRAPHY': 'geography'
    };

    return typeMap[bqType.toUpperCase()] ?? 'unknown';
  }

  /**
   * Parse and validate table name for BigQuery
   */
  private parseTableName(tableName: string): string {
    validateDatabaseIdentifier(tableName, 'table');

    const parts = tableName.split('.');

    if (parts.length === 3) {
      // project.dataset.table format
      const [project, _dataset, _table] = parts;

      // Validate project matches
      if (project !== this.projectId) {
        throw new SecurityError('Table project does not match configured project');
      }

      return tableName;
    } else if (parts.length === 2) {
      // dataset.table format - prepend project
      return `${this.projectId}.${tableName}`;
    } else if (parts.length === 1) {
      // Just table name - need dataset
      throw new QueryError('Table name must include dataset (format: dataset.table)', 'invalid_table_name');
    } else {
      throw new QueryError('Invalid table name format', 'invalid_table_name');
    }
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

    const options = credentials.additionalOptions ?? {};
    const projectId = (options.projectId as string) ?? credentials.database ?? '';

    if (!projectId) {
      throw new ConfigurationError('BigQuery project ID is required');
    }

    const config: ConnectorConfig = {
      host: 'bigquery.googleapis.com',
      port: 443,
      database: projectId,
      username: credentials.username ?? 'bigquery',
      password: credentials.password ?? '',
      ssl: true
    };

    // Set location if provided
    if (options.location) {
      this.location = options.location as string;
      this.locationExplicitlySet = true;
    }

    // Validate and reconnect
    BigQueryConnector.validateBigQueryConfig(config);
    this.config = { ...this.config, ...config };
    this.projectId = config.database;
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

  /**
   * Get BigQuery project ID
   */
  getProjectId(): string {
    return this.projectId;
  }

  /**
   * Set BigQuery location/region
   */
  setLocation(location: string): void {
    this.location = location;
    this.locationExplicitlySet = true;
  }

  /**
   * Get current BigQuery location/region
   */
  getLocation(): string {
    return this.location;
  }

  /**
   * Scope subsequent `listTables()` calls to a single dataset.
   *
   * When a dataset is set, `listTables()` queries
   * `{project}.{dataset}.INFORMATION_SCHEMA.TABLES` instead of the
   * project-wide `INFORMATION_SCHEMA.TABLES`.  This is required when the
   * service account only has dataset-level permissions.
   */
  setDataset(dataset: string): void {
    validateTableName(dataset);
    this.dataset = dataset;
  }

  /**
   * Get the currently configured dataset, or `undefined` if not set.
   */
  getDataset(): string | undefined {
    return this.dataset;
  }
}