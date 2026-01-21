/**
 * Tests for database connectors
 */

import { describe, it, expect } from 'vitest';
import { PostgresConnector } from '../src/connectors/postgres.js';
import { DuckDBConnector } from '../src/connectors/duckdb.js';
import { BigQueryConnector } from '../src/connectors/bigquery.js';
import { SnowflakeConnector } from '../src/connectors/snowflake.js';

describe('PostgresConnector', () => {
  it('should instantiate without errors', () => {
    expect(() => new PostgresConnector()).not.toThrow();
  });

  it('should have required methods', () => {
    const connector = new PostgresConnector();
    expect(connector.connect).toBeDefined();
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
    expect(connector.query).toBeDefined();
    expect(connector.close).toBeDefined();
  });
});

describe('DuckDBConnector', () => {
  it('should instantiate without errors', () => {
    expect(() => new DuckDBConnector()).not.toThrow();
  });

  it('should have required methods', () => {
    const connector = new DuckDBConnector();
    expect(connector.connect).toBeDefined();
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
    expect(connector.query).toBeDefined();
    expect(connector.close).toBeDefined();
  });
});

describe('BigQueryConnector', () => {
  it('should instantiate without errors', () => {
    expect(() => new BigQueryConnector()).not.toThrow();
  });

  it('should have required methods', () => {
    const connector = new BigQueryConnector();
    expect(connector.connect).toBeDefined();
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
    expect(connector.query).toBeDefined();
    expect(connector.close).toBeDefined();
  });
});

describe('SnowflakeConnector', () => {
  it('should instantiate without errors', () => {
    expect(() => new SnowflakeConnector()).not.toThrow();
  });

  it('should have required methods', () => {
    const connector = new SnowflakeConnector();
    expect(connector.connect).toBeDefined();
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
    expect(connector.getTableMetadata).toBeDefined();
    expect(connector.query).toBeDefined();
    expect(connector.close).toBeDefined();
  });
});
