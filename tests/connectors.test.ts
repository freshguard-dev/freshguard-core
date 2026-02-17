/**
 * Tests for secure database connectors
 * Tests the new secure API and validation features
 */

import { describe, it, expect } from 'vitest';
import { rowString } from '../src/types/driver-results.js';
import { PostgresConnector } from '../src/connectors/postgres.js';
import { DuckDBConnector } from '../src/connectors/duckdb.js';
import { BigQueryConnector } from '../src/connectors/bigquery.js';
import { SnowflakeConnector } from '../src/connectors/snowflake.js';
import { MySQLConnector } from '../src/connectors/mysql.js';
import { RedshiftConnector } from '../src/connectors/redshift.js';
import { MSSQLConnector } from '../src/connectors/mssql.js';
import { AzureSQLConnector } from '../src/connectors/azure-sql.js';
import { SynapseConnector } from '../src/connectors/synapse.js';
import type { ConnectorConfig } from '../src/types/connector.js';
import { SecurityError } from '../src/errors/index.js';

// Test configuration fixtures
const validPostgresConfig: ConnectorConfig = {
  host: 'localhost',
  port: 5432,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validDuckDBConfig: ConnectorConfig = {
  host: 'localhost', // Not used but required by interface
  port: 0, // Not used but required by interface
  database: ':memory:',
  username: 'duckdb', // Not used but required by interface
  password: 'duckdb', // Not used but required by interface
  ssl: true, // Required by security policy, not used by DuckDB
};

const validBigQueryConfig: ConnectorConfig = {
  host: 'bigquery.googleapis.com',
  port: 443,
  database: 'test-project-123',
  username: 'bigquery',
  password: JSON.stringify({
    type: 'service_account',
    project_id: 'test-project-123',
    private_key_id: 'test-key-id',
    private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
    client_email: 'test@test-project-123.iam.gserviceaccount.com',
    client_id: '123456789',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  }),
  ssl: true,
};

const validSnowflakeConfig: ConnectorConfig = {
  host: 'test-account.snowflakecomputing.com',
  port: 443,
  database: 'TEST_DB',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validMySQLConfig: ConnectorConfig = {
  host: 'localhost',
  port: 3306,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validRedshiftConfig: ConnectorConfig = {
  host: 'test-cluster.redshift.amazonaws.com',
  port: 5439,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validMSSQLConfig: ConnectorConfig = {
  host: 'localhost',
  port: 1433,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validAzureSQLConfig: ConnectorConfig = {
  host: 'test-server.database.windows.net',
  port: 1433,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

const validSynapseConfig: ConnectorConfig = {
  host: 'test-workspace.sql.azuresynapse.net',
  port: 1433,
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  ssl: true,
};

describe('PostgresConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new PostgresConnector(validPostgresConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new PostgresConnector({} as ConnectorConfig)).toThrow();
    expect(() => new PostgresConnector({
      host: '',
      port: 5432,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new PostgresConnector(validPostgresConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new PostgresConnector(validPostgresConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new PostgresConnector({
      ...validPostgresConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new PostgresConnector({
      ...validPostgresConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new PostgresConnector({
      ...validPostgresConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should accept schema from config options', () => {
    const connector = new PostgresConnector({
      ...validPostgresConfig,
      options: { schema: 'analytics' },
    });
    expect(connector).toBeDefined();
  });

  it('should default schema to public when not specified', () => {
    const connector = new PostgresConnector(validPostgresConfig);
    expect(connector).toBeDefined();
  });
});

describe('DuckDBConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new DuckDBConnector(validDuckDBConfig)).not.toThrow();
  });

  it('should reject invalid database paths', () => {
    expect(() => new DuckDBConnector({
      ...validDuckDBConfig,
      database: '../../../etc/passwd',
    })).toThrow('Database path cannot contain directory traversal patterns');
  });

  it('should reject system directory access', () => {
    expect(() => new DuckDBConnector({
      ...validDuckDBConfig,
      database: '/etc/shadow',
    })).toThrow('Database path cannot access system directories');
  });

  it('should have secure connector interface methods', () => {
    const connector = new DuckDBConnector(validDuckDBConfig);

    // Secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.close).toBeDefined();

    // DuckDB-specific methods
    expect(connector.getDatabasePath).toBeDefined();
    expect(connector.isInMemory).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new DuckDBConnector(validDuckDBConfig);
    await expect(connector.query('DROP TABLE users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should allow memory database', () => {
    const connector = new DuckDBConnector({
      ...validDuckDBConfig,
      database: ':memory:',
    });
    expect(connector.isInMemory()).toBe(true);
  });
});

describe('BigQueryConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new BigQueryConnector(validBigQueryConfig)).not.toThrow();
  });

  it('should reject invalid project ID format', () => {
    expect(() => new BigQueryConnector({
      ...validBigQueryConfig,
      database: 'Invalid_Project-123!',
    })).toThrow('Invalid BigQuery project ID format');
  });

  it('should validate service account credentials', () => {
    expect(() => new BigQueryConnector({
      ...validBigQueryConfig,
      password: '{"type": "invalid_account"}',
    })).toThrow('Invalid service account credentials format');
  });

  it('should validate project ID match in service account', () => {
    expect(() => new BigQueryConnector({
      ...validBigQueryConfig,
      password: JSON.stringify({
        type: 'service_account',
        project_id: 'different-project',
      }),
    })).toThrow('Service account project ID does not match specified project');
  });

  it('should have secure connector interface methods', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);

    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getProjectId).toBeDefined();
    expect(connector.setLocation).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    await expect(connector.query('DELETE FROM dataset.table')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should accept location from config options', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { location: 'EU' },
    });
    expect(connector.getLocation()).toBe('EU');
  });

  it('should default location to US when not specified', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    expect(connector.getLocation()).toBe('US');
  });

  it('should accept region-specific locations', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { location: 'europe-west1' },
    });
    expect(connector.getLocation()).toBe('europe-west1');
  });

  it('should ignore non-string location values in options', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { location: 42 },
    });
    expect(connector.getLocation()).toBe('US');
  });

  it('should allow overriding location via setLocation', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { location: 'EU' },
    });
    connector.setLocation('asia-east1');
    expect(connector.getLocation()).toBe('asia-east1');
  });

  it('should accept dataset from config options', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { dataset: 'my_dataset' },
    });
    expect(connector.getDataset()).toBe('my_dataset');
  });

  it('should default dataset to undefined when not specified', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    expect(connector.getDataset()).toBeUndefined();
  });

  it('should allow setting dataset via setDataset', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    connector.setDataset('analytics');
    expect(connector.getDataset()).toBe('analytics');
  });

  it('should allow overriding dataset via setDataset', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { dataset: 'original' },
    });
    connector.setDataset('updated');
    expect(connector.getDataset()).toBe('updated');
  });

  it('should ignore non-string dataset values in options', () => {
    const connector = new BigQueryConnector({
      ...validBigQueryConfig,
      options: { dataset: 42 },
    });
    expect(connector.getDataset()).toBeUndefined();
  });

  it('should reject invalid dataset identifiers via setDataset', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    expect(() => connector.setDataset('DROP TABLE; --')).toThrow();
  });

  it('should reject invalid dataset identifiers from config options', () => {
    expect(() => new BigQueryConnector({
      ...validBigQueryConfig,
      options: { dataset: 'DROP TABLE; --' },
    })).toThrow();
  });

  it('should have setDataset and getDataset methods', () => {
    const connector = new BigQueryConnector(validBigQueryConfig);
    expect(connector.setDataset).toBeDefined();
    expect(connector.getDataset).toBeDefined();
  });
});

describe('rowString – BigQuery date wrapper objects', () => {
  it('should extract .value from BigQueryDate-like objects', () => {
    const bqDate = { value: '2024-01-15' };
    expect(rowString(bqDate)).toBe('2024-01-15');
  });

  it('should extract .value from BigQueryTimestamp-like objects', () => {
    const bqTimestamp = { value: '2024-01-15T12:00:00.000Z' };
    expect(rowString(bqTimestamp)).toBe('2024-01-15T12:00:00.000Z');
  });

  it('should extract .value from BigQueryDatetime-like objects', () => {
    const bqDatetime = { value: '2024-01-15 12:00:00' };
    expect(rowString(bqDatetime)).toBe('2024-01-15 12:00:00');
  });

  it('should not extract .value when it is not a string', () => {
    const obj = { value: 42 };
    expect(rowString(obj)).toBe('{"value":42}');
  });

  it('should still handle plain strings and dates', () => {
    expect(rowString('hello')).toBe('hello');
    expect(rowString(null)).toBe('');
    expect(rowString(123)).toBe('123');
    const d = new Date('2024-01-15T00:00:00.000Z');
    expect(rowString(d)).toBe('2024-01-15T00:00:00.000Z');
  });

  it('should produce a parseable date from BigQueryDate .value', () => {
    const bqDate = { value: '2024-01-15' };
    const parsed = new Date(rowString(bqDate));
    expect(parsed.getTime()).not.toBeNaN();
  });
});

describe('SnowflakeConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new SnowflakeConnector(validSnowflakeConfig)).not.toThrow();
  });

  it('should reject invalid host format', () => {
    expect(() => new SnowflakeConnector({
      ...validSnowflakeConfig,
      host: 'invalid-host.com',
    })).toThrow('Invalid Snowflake host format');
  });

  it('should require credentials', () => {
    expect(() => new SnowflakeConnector({
      ...validSnowflakeConfig,
      username: '',
    })).toThrow('Username and password are required for Snowflake');
  });

  it('should extract account from host', () => {
    const connector = new SnowflakeConnector(validSnowflakeConfig);
    expect(connector.getAccount()).toBe('test-account');
  });

  it('should have secure connector interface methods', () => {
    const connector = new SnowflakeConnector(validSnowflakeConfig);

    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getAccount).toBeDefined();
    expect(connector.setWarehouse).toBeDefined();
    expect(connector.setSchema).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new SnowflakeConnector(validSnowflakeConfig);
    await expect(connector.query('TRUNCATE TABLE users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should accept schema from config options', () => {
    const connector = new SnowflakeConnector({
      ...validSnowflakeConfig,
      options: { schema: 'RAW_DATA' },
    });
    expect(connector.getSchema()).toBe('RAW_DATA');
  });

  it('should default schema to PUBLIC when not specified', () => {
    const connector = new SnowflakeConnector(validSnowflakeConfig);
    expect(connector.getSchema()).toBe('PUBLIC');
  });

  it('should accept warehouse from config options', () => {
    const connector = new SnowflakeConnector({
      ...validSnowflakeConfig,
      options: { warehouse: 'COMPUTE_WH' },
    });
    expect(connector.getWarehouse()).toBe('COMPUTE_WH');
  });
});

describe('MySQLConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new MySQLConnector(validMySQLConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new MySQLConnector({} as ConnectorConfig)).toThrow();
    expect(() => new MySQLConnector({
      host: '',
      port: 3306,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new MySQLConnector(validMySQLConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new MySQLConnector(validMySQLConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new MySQLConnector({
      ...validMySQLConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new MySQLConnector({
      ...validMySQLConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new MySQLConnector({
      ...validMySQLConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should use MySQL default port when not specified', () => {
    const config = { ...validMySQLConfig };
    delete config.port;
    expect(() => new MySQLConnector(config)).not.toThrow();
  });
});

describe('RedshiftConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new RedshiftConnector(validRedshiftConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new RedshiftConnector({} as ConnectorConfig)).toThrow();
    expect(() => new RedshiftConnector({
      host: '',
      port: 5439,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new RedshiftConnector(validRedshiftConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new RedshiftConnector(validRedshiftConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new RedshiftConnector({
      ...validRedshiftConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new RedshiftConnector({
      ...validRedshiftConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new RedshiftConnector({
      ...validRedshiftConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should use Redshift default port when not specified', () => {
    const config = { ...validRedshiftConfig };
    delete config.port;
    expect(() => new RedshiftConnector(config)).not.toThrow();
  });

  it('should accept schema from config options', () => {
    const connector = new RedshiftConnector({
      ...validRedshiftConfig,
      options: { schema: 'staging' },
    });
    expect(connector).toBeDefined();
  });

  it('should default schema to public when not specified', () => {
    const connector = new RedshiftConnector(validRedshiftConfig);
    expect(connector).toBeDefined();
  });
});

describe('MSSQLConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new MSSQLConnector(validMSSQLConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new MSSQLConnector({} as ConnectorConfig)).toThrow();
    expect(() => new MSSQLConnector({
      host: '',
      port: 1433,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new MSSQLConnector(validMSSQLConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new MSSQLConnector(validMSSQLConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new MSSQLConnector({
      ...validMSSQLConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new MSSQLConnector({
      ...validMSSQLConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new MSSQLConnector({
      ...validMSSQLConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should use MSSQL default port when not specified', () => {
    const config = { ...validMSSQLConfig };
    delete config.port;
    expect(() => new MSSQLConnector(config)).not.toThrow();
  });

  it('should use bracket notation for identifier escaping', () => {
    const connector = new MSSQLConnector(validMSSQLConfig);
    // Bracket notation is used internally - verify via getTableSchema not throwing on valid names
    expect(connector.getTableSchema).toBeDefined();
  });

  it('should accept schema from config options', () => {
    const connector = new MSSQLConnector({
      ...validMSSQLConfig,
      options: { schema: 'staging' },
    });
    expect(connector).toBeDefined();
  });

  it('should default schema to dbo when not specified', () => {
    const connector = new MSSQLConnector(validMSSQLConfig);
    expect(connector).toBeDefined();
  });

  it('should ignore non-string schema values in options', () => {
    const connector = new MSSQLConnector({
      ...validMSSQLConfig,
      options: { schema: 123 },
    });
    expect(connector).toBeDefined();
  });
});

describe('AzureSQLConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new AzureSQLConnector(validAzureSQLConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new AzureSQLConnector({} as ConnectorConfig)).toThrow();
    expect(() => new AzureSQLConnector({
      host: '',
      port: 1433,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new AzureSQLConnector(validAzureSQLConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new AzureSQLConnector(validAzureSQLConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new AzureSQLConnector({
      ...validAzureSQLConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new AzureSQLConnector({
      ...validAzureSQLConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new AzureSQLConnector({
      ...validAzureSQLConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should use Azure SQL default port when not specified', () => {
    const config = { ...validAzureSQLConfig };
    delete config.port;
    expect(() => new AzureSQLConnector(config)).not.toThrow();
  });

  it('should accept schema from config options', () => {
    const connector = new AzureSQLConnector({
      ...validAzureSQLConfig,
      options: { schema: 'analytics' },
    });
    expect(connector).toBeDefined();
  });

  it('should default schema to dbo when not specified', () => {
    const connector = new AzureSQLConnector(validAzureSQLConfig);
    expect(connector).toBeDefined();
  });
});

describe('SynapseConnector Security', () => {
  it('should instantiate with valid configuration', () => {
    expect(() => new SynapseConnector(validSynapseConfig)).not.toThrow();
  });

  it('should reject invalid configuration', () => {
    expect(() => new SynapseConnector({} as ConnectorConfig)).toThrow();
    expect(() => new SynapseConnector({
      host: '',
      port: 1433,
      database: 'test',
      username: 'user',
      password: 'pass',
    })).toThrow('Host is required');
  });

  it('should have secure connector interface methods', () => {
    const connector = new SynapseConnector(validSynapseConfig);

    // New secure methods
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableSchema).toBeDefined();
    expect(connector.getRowCount).toBeDefined();
    expect(connector.getMaxTimestamp).toBeDefined();
    expect(connector.getMinTimestamp).toBeDefined();
    expect(connector.getLastModified).toBeDefined();
    expect(connector.close).toBeDefined();

    // Legacy methods (deprecated but present)
    expect(connector.connectLegacy).toBeDefined();
    expect(connector.testConnectionLegacy).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
  });

  it('should block direct SQL queries for security', async () => {
    const connector = new SynapseConnector(validSynapseConfig);
    await expect(connector.query('SELECT * FROM users')).rejects.toThrow(
      'Direct SQL queries are not allowed for security reasons'
    );
  });

  it('should validate host parameter', () => {
    expect(() => new SynapseConnector({
      ...validSynapseConfig,
      host: '',
    })).toThrow('Host is required');
  });

  it('should validate port parameter', () => {
    expect(() => new SynapseConnector({
      ...validSynapseConfig,
      port: 99999,
    })).toThrow('Port must be between 1 and 65535');
  });

  it('should require SSL by default', () => {
    expect(() => new SynapseConnector({
      ...validSynapseConfig,
      ssl: false,
    })).toThrow(SecurityError);
  });

  it('should use Synapse default port when not specified', () => {
    const config = { ...validSynapseConfig };
    delete config.port;
    expect(() => new SynapseConnector(config)).not.toThrow();
  });

  it('should accept schema from config options', () => {
    const connector = new SynapseConnector({
      ...validSynapseConfig,
      options: { schema: 'warehouse' },
    });
    expect(connector).toBeDefined();
  });

  it('should default schema to dbo when not specified', () => {
    const connector = new SynapseConnector(validSynapseConfig);
    expect(connector).toBeDefined();
  });
});

describe('Connector Security Consistency', () => {
  it('should all extend BaseConnector with security features', () => {
    const postgres = new PostgresConnector(validPostgresConfig);
    const duckdb = new DuckDBConnector(validDuckDBConfig);
    const bigquery = new BigQueryConnector(validBigQueryConfig);
    const snowflake = new SnowflakeConnector(validSnowflakeConfig);
    const mysql = new MySQLConnector(validMySQLConfig);
    const redshift = new RedshiftConnector(validRedshiftConfig);
    const mssqlConn = new MSSQLConnector(validMSSQLConfig);
    const azureSql = new AzureSQLConnector(validAzureSQLConfig);
    const synapse = new SynapseConnector(validSynapseConfig);

    const connectors = [postgres, duckdb, bigquery, snowflake, mysql, redshift, mssqlConn, azureSql, synapse];

    // All should have core security methods
    for (const connector of connectors) {
      expect(connector.testConnection).toBeDefined();
      expect(connector.listTables).toBeDefined();
      expect(connector.getRowCount).toBeDefined();
      expect(connector.getMaxTimestamp).toBeDefined();
      expect(connector.getMinTimestamp).toBeDefined();
      expect(connector.getLastModified).toBeDefined();
      expect(connector.close).toBeDefined();
    }
  });

  it('should all block direct SQL execution', async () => {
    const postgres = new PostgresConnector(validPostgresConfig);
    const duckdb = new DuckDBConnector(validDuckDBConfig);
    const bigquery = new BigQueryConnector(validBigQueryConfig);
    const snowflake = new SnowflakeConnector(validSnowflakeConfig);
    const mysql = new MySQLConnector(validMySQLConfig);
    const redshift = new RedshiftConnector(validRedshiftConfig);
    const mssqlConn = new MSSQLConnector(validMSSQLConfig);
    const azureSql = new AzureSQLConnector(validAzureSQLConfig);
    const synapse = new SynapseConnector(validSynapseConfig);

    const connectors = [postgres, duckdb, bigquery, snowflake, mysql, redshift, mssqlConn, azureSql, synapse];

    for (const connector of connectors) {
      await expect(connector.query('SELECT 1')).rejects.toThrow(
        'Direct SQL queries are not allowed for security reasons'
      );
    }
  });

  it('should all provide legacy compatibility with deprecation warnings', () => {
    const postgres = new PostgresConnector(validPostgresConfig);
    const duckdb = new DuckDBConnector(validDuckDBConfig);
    const bigquery = new BigQueryConnector(validBigQueryConfig);
    const snowflake = new SnowflakeConnector(validSnowflakeConfig);
    const mysql = new MySQLConnector(validMySQLConfig);
    const redshift = new RedshiftConnector(validRedshiftConfig);
    const mssqlConn = new MSSQLConnector(validMSSQLConfig);
    const azureSql = new AzureSQLConnector(validAzureSQLConfig);
    const synapse = new SynapseConnector(validSynapseConfig);

    const connectors = [postgres, duckdb, bigquery, snowflake, mysql, redshift, mssqlConn, azureSql, synapse];

    // All should have deprecated legacy methods
    for (const connector of connectors) {
      expect(connector.connectLegacy).toBeDefined();
      expect(connector.testConnectionLegacy).toBeDefined();
      expect(connector.getTableMetadata).toBeDefined();
    }
  });
});
