/**
 * Tests for database connectors
 */

import { describe, it, expect } from 'vitest';
import { PostgresConnector } from '../src/connectors/postgres.js';
import { DuckDBConnector } from '../src/connectors/duckdb.js';

describe('PostgresConnector', () => {
  it('should instantiate without errors', () => {
    expect(() => new PostgresConnector()).not.toThrow();
  });

  it('should have required methods', () => {
    const connector = new PostgresConnector();
    expect(connector.connect).toBeDefined();
    expect(connector.testConnection).toBeDefined();
    expect(connector.listTables).toBeDefined();
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
    expect(connector.query).toBeDefined();
    expect(connector.close).toBeDefined();
  });
});
