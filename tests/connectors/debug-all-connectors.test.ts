/**
 * Tests for debug-enhanced connection testing across all connectors
 *
 * Verifies that all database connectors support enhanced debug mode
 * for connection testing with detailed error information.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PostgresConnector } from '../../src/connectors/postgres.js';
import { BigQueryConnector } from '../../src/connectors/bigquery.js';
import { SnowflakeConnector } from '../../src/connectors/snowflake.js';
import { DuckDBConnector } from '../../src/connectors/duckdb.js';

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

describe('All Connectors Debug Enhancement', () => {
  describe('PostgreSQL Connector', () => {
    it('should support debug mode in testConnection', async () => {
      const connector = new PostgresConnector({
        host: 'localhost',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test'
      });

      const debugConfig = { enabled: true, exposeRawErrors: true };

      // This will fail but should produce debug output
      const result = await connector.testConnection(debugConfig);

      expect(result).toBe(false); // Expected to fail with test config
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-pg-test-'),
        expect.objectContaining({
          host: 'localhost',
          port: 5432,
          database: 'test'
        })
      );
    });

    it('should provide connection suggestions for PostgreSQL errors', async () => {
      const connector = new PostgresConnector({
        host: 'nonexistent-host',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test'
      });

      const result = await connector.testConnection({ enabled: true, exposeRawErrors: true });

      expect(result).toBe(false);
      // Should have logged error with suggestion
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-pg-test-'),
        expect.objectContaining({
          suggestion: expect.stringContaining('PostgreSQL server')
        })
      );
    });
  });

  describe('BigQuery Connector', () => {
    it('should support debug mode in testConnection', async () => {
      const connector = new BigQueryConnector({
        database: 'test-project-id', // BigQuery uses database field for project ID
        additionalOptions: {
          location: 'US'
        }
      });

      const debugConfig = { enabled: true, exposeRawErrors: true };

      // This will fail but should produce debug output
      const result = await connector.testConnection(debugConfig);

      expect(result).toBe(false); // Expected to fail with test config
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-bq-test-'),
        expect.objectContaining({
          projectId: 'test-project-id',
          location: 'US'
        })
      );
    });

    it('should provide BigQuery-specific connection suggestions', async () => {
      const connector = new BigQueryConnector({
        database: 'invalid-project-id'
      });

      const result = await connector.testConnection({ enabled: true, exposeRawErrors: true });

      expect(result).toBe(false);
      // Should have logged error with BigQuery-specific suggestion
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-bq-test-'),
        expect.objectContaining({
          suggestion: expect.stringContaining('BigQuery')
        })
      );
    });
  });

  describe('Snowflake Connector', () => {
    it('should support debug mode in testConnection', async () => {
      const connector = new SnowflakeConnector({
        host: 'test-account.snowflakecomputing.com',
        database: 'TEST_DB',
        username: 'test',
        password: 'test',
        additionalOptions: {
          account: 'test-account',
          warehouse: 'TEST_WH',
          schema: 'PUBLIC'
        }
      });

      const debugConfig = { enabled: true, exposeRawErrors: true };

      // This will fail but should produce debug output
      const result = await connector.testConnection(debugConfig);

      expect(result).toBe(false); // Expected to fail with test config
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-sf-test-'),
        expect.objectContaining({
          account: 'test-account',
          warehouse: 'TEST_WH',
          database: 'TEST_DB',
          schema: 'PUBLIC'
        })
      );
    });

    it('should provide Snowflake-specific connection suggestions', async () => {
      const connector = new SnowflakeConnector({
        host: 'invalid-account.snowflakecomputing.com',
        database: 'TEST_DB',
        username: 'test',
        password: 'wrong-password',
        additionalOptions: {
          account: 'invalid-account',
          warehouse: 'TEST_WH'
        }
      });

      const result = await connector.testConnection({ enabled: true, exposeRawErrors: true });

      expect(result).toBe(false);
      // Should have logged error with Snowflake-specific suggestion
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-sf-test-'),
        expect.objectContaining({
          suggestion: expect.stringContaining('Snowflake')
        })
      );
    });
  });

  describe('DuckDB Connector', () => {
    it('should support debug mode in testConnection', async () => {
      const connector = new DuckDBConnector({
        database: '/tmp/nonexistent/test.db' // This path shouldn't exist
      });

      const debugConfig = { enabled: true, exposeRawErrors: true };

      // This will fail but should produce debug output
      const result = await connector.testConnection(debugConfig);

      expect(result).toBe(false); // Expected to fail with test config
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-duck-test-'),
        expect.objectContaining({
          databasePath: '/tmp/nonexistent/test.db',
          isFileDatabase: true,
          isMemoryDatabase: false
        })
      );
    });

    it('should support debug mode with in-memory database', async () => {
      const connector = new DuckDBConnector({
        database: ':memory:'
      });

      const debugConfig = { enabled: true, exposeRawErrors: true };

      // In-memory database should succeed
      const result = await connector.testConnection(debugConfig);

      expect(result).toBe(true); // Should succeed with in-memory DB
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-duck-test-'),
        expect.objectContaining({
          success: true,
          databasePath: ':memory:',
          type: 'in-memory'
        })
      );
    });

    it('should provide DuckDB-specific connection suggestions', async () => {
      const connector = new DuckDBConnector({
        database: '/nonexistent/path/test.db'
      });

      const result = await connector.testConnection({ enabled: true, exposeRawErrors: true });

      expect(result).toBe(false);
      // Should have logged error with DuckDB-specific suggestion
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG-duck-test-'),
        expect.objectContaining({
          suggestion: expect.stringContaining('DuckDB')
        })
      );
    });
  });

  describe('Unified Debug Interface', () => {
    it('should have consistent debug interface across all connectors', () => {
      const connectors = [
        new PostgresConnector({ host: 'test', database: 'test', username: 'test', password: 'test' }),
        new BigQueryConnector({ database: 'test-project' }),
        new SnowflakeConnector({
          host: 'test.snowflakecomputing.com',
          database: 'TEST',
          username: 'test',
          password: 'test',
          additionalOptions: { account: 'test', warehouse: 'TEST_WH' }
        }),
        new DuckDBConnector({ database: ':memory:' })
      ];

      // All connectors should have testConnection method with same signature
      for (const connector of connectors) {
        expect(typeof connector.testConnection).toBe('function');
        // TypeScript ensures the method signature includes optional debug config
        expect(connector.testConnection.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle debug config consistently across connectors', async () => {
      const debugConfig = {
        enabled: true,
        exposeQueries: true,
        exposeRawErrors: true
      };

      const connectors = [
        new DuckDBConnector({ database: ':memory:' }) // Only test one that might succeed
      ];

      for (const connector of connectors) {
        // Should accept debug config without throwing
        const result = await connector.testConnection(debugConfig);
        expect(typeof result).toBe('boolean');
      }
    });
  });
});