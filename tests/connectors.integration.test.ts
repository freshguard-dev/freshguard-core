/**
 * Integration Tests for Database Connectors
 * Tests actual database connections with real test data
 *
 * Requirements:
 * - Docker containers must be running: `docker-compose up -d postgres_test duckdb_test`
 * - Test databases are seeded with realistic test data
 *
 * These tests verify:
 * - Real database connections
 * - Actual query execution
 * - Data retrieval and metadata
 * - Error handling with real connection failures
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PostgresConnector } from '../src/connectors/postgres.js';
import { DuckDBConnector } from '../src/connectors/duckdb.js';

// Test configuration
const TEST_CONFIG = {
  postgres: {
    host: 'localhost',
    port: 5433,
    database: 'customer_test_db',
    username: 'test_user',
    password: 'test_pass',
    sslMode: 'disable' as const,
  },
  duckdb: {
    filePath: '/tmp/customer_test.duckdb', // Local file path for testing
  },
  timeout: 30000, // 30 second timeout for Docker container startup
};

describe('PostgreSQL Integration Tests', () => {
  let connector: PostgresConnector;
  let isConnected = false;

  beforeAll(async () => {
    connector = new PostgresConnector();
    try {
      await connector.connect(TEST_CONFIG.postgres);
      isConnected = true;
    } catch (error) {
      console.warn('PostgreSQL test database not available. Skipping integration tests.');
      console.warn('To run these tests: docker-compose up -d postgres_test');
      console.warn(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    if (isConnected && connector) {
      await connector.close();
    }
  });

  it('should connect to test database successfully', { skip: !isConnected }, async () => {
    const testResult = await connector.testConnection();
    expect(testResult.success).toBe(true);
    expect(testResult.tableCount).toBeGreaterThan(0);
    expect(testResult.error).toBeUndefined();
  });

  it('should list tables in test database', { skip: !isConnected }, async () => {
    const tables = await connector.listTables();

    expect(tables).toBeInstanceOf(Array);
    expect(tables.length).toBeGreaterThan(0);

    // Verify expected test tables exist
    expect(tables).toContain('customers');
    expect(tables).toContain('orders');
    expect(tables).toContain('products');
    expect(tables).toContain('daily_summary');
    expect(tables).toContain('user_sessions');
  });

  it('should get table metadata for orders table', { skip: !isConnected }, async () => {
    const metadata = await connector.getTableMetadata('orders', 'updated_at');

    expect(metadata.rowCount).toBeGreaterThan(0);
    expect(metadata.lastUpdate).toBeInstanceOf(Date);

    // Verify the timestamp is recent (test data has recent orders)
    const timeDiff = Date.now() - metadata.lastUpdate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    expect(hoursDiff).toBeLessThan(24); // Should be less than 24 hours old
  });

  it('should execute custom queries', { skip: !isConnected }, async () => {
    const result = await connector.query<{ count: number }>('SELECT COUNT(*) as count FROM orders');

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0].count).toBeGreaterThan(0);
  });

  it('should handle freshness monitoring queries', { skip: !isConnected }, async () => {
    // Simulate a freshness check query (like the monitoring system would do)
    const result = await connector.query<{ row_count: number; last_update: Date }>(`
      SELECT
        COUNT(*) as row_count,
        MAX(updated_at) as last_update
      FROM orders
      WHERE updated_at > NOW() - INTERVAL '24 hours'
    `);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0].row_count).toBeGreaterThan(0);
    expect(result[0].last_update).toBeInstanceOf(Date);
  });

  it('should handle volume anomaly queries', { skip: !isConnected }, async () => {
    // Simulate a volume check query
    const result = await connector.query<{ date: string; count: number }>(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM user_sessions
      WHERE created_at > NOW() - INTERVAL '3 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);

    // Should have data for recent days
    const recentCounts = result.filter(row => {
      const rowDate = new Date(row.date);
      const daysDiff = (Date.now() - rowDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 2;
    });

    expect(recentCounts.length).toBeGreaterThan(0);
  });

  it('should handle connection errors gracefully', async () => {
    const badConnector = new PostgresConnector();

    try {
      // Try to connect with bad credentials
      await badConnector.connect({
        host: 'nonexistent-host.example.com',
        port: 5432,
        database: 'test',
        username: 'test',
        password: 'test',
        sslMode: 'disable',
      });

      // If we get here, the connection somehow succeeded (unexpected)
      const testResult = await badConnector.testConnection();
      expect(testResult.success).toBe(false);
    } catch (error) {
      // Expected: connection should fail
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/ENOTFOUND|ECONNREFUSED|getaddrinfo/);
    } finally {
      // Clean up
      try {
        await badConnector.close();
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  it('should handle invalid queries gracefully', { skip: !isConnected }, async () => {
    try {
      await connector.query('SELECT * FROM nonexistent_table');
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('nonexistent_table');
    }
  });
});

describe('DuckDB Integration Tests', () => {
  let connector: DuckDBConnector;
  let isAvailable = false;

  beforeAll(async () => {
    // Check if DuckDB is available (may have native binding issues)
    try {
      connector = new DuckDBConnector();
      // Try to connect to an in-memory database first (safest test)
      await connector.connect({ filePath: ':memory:' });
      isAvailable = true;
      await connector.close();

      // Now connect to test database (if file exists)
      await connector.connect(TEST_CONFIG.duckdb);
    } catch (error) {
      console.warn('DuckDB not available. Skipping integration tests.');
      console.warn('This is expected if DuckDB native bindings are not compiled.');
      console.warn(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      isAvailable = false;
    }
  });

  afterAll(async () => {
    if (isAvailable && connector) {
      try {
        await connector.close();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it('should connect to in-memory database', { skip: !isAvailable }, async () => {
    const memConnector = new DuckDBConnector();
    await memConnector.connect({ filePath: ':memory:' });

    const testResult = await memConnector.testConnection();
    expect(testResult.success).toBe(true);
    expect(testResult.tableCount).toBe(0); // Empty in-memory database

    await memConnector.close();
  });

  it('should create and query tables', { skip: !isAvailable }, async () => {
    const memConnector = new DuckDBConnector();
    await memConnector.connect({ filePath: ':memory:' });

    // Create a test table
    await memConnector.query(`
      CREATE TABLE test_table (
        id INTEGER,
        name VARCHAR,
        created_at TIMESTAMP DEFAULT current_timestamp
      )
    `);

    // Insert test data
    await memConnector.query(`
      INSERT INTO test_table (id, name) VALUES
      (1, 'Test Item 1'),
      (2, 'Test Item 2'),
      (3, 'Test Item 3')
    `);

    // Query the data
    const result = await memConnector.query<{ id: number; name: string }>('SELECT id, name FROM test_table ORDER BY id');

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ id: 1, name: 'Test Item 1' });
    expect(result[2]).toEqual({ id: 3, name: 'Test Item 3' });

    await memConnector.close();
  });

  it('should list tables', { skip: !isAvailable }, async () => {
    const memConnector = new DuckDBConnector();
    await memConnector.connect({ filePath: ':memory:' });

    // Create test tables
    await memConnector.query('CREATE TABLE table1 (id INTEGER)');
    await memConnector.query('CREATE TABLE table2 (name VARCHAR)');

    const tables = await memConnector.listTables();

    expect(tables).toBeInstanceOf(Array);
    expect(tables).toContain('table1');
    expect(tables).toContain('table2');

    await memConnector.close();
  });

  it('should get table metadata', { skip: !isAvailable }, async () => {
    const memConnector = new DuckDBConnector();
    await memConnector.connect({ filePath: ':memory:' });

    // Create table with timestamp
    await memConnector.query(`
      CREATE TABLE test_metadata (
        id INTEGER,
        updated_at TIMESTAMP DEFAULT current_timestamp
      )
    `);

    // Insert test data
    await memConnector.query('INSERT INTO test_metadata (id) VALUES (1), (2), (3)');

    const metadata = await memConnector.getTableMetadata('test_metadata', 'updated_at');

    expect(metadata.rowCount).toBe(3);
    expect(metadata.lastUpdate).toBeInstanceOf(Date);

    // Should be very recent (just created)
    const timeDiff = Date.now() - metadata.lastUpdate.getTime();
    expect(timeDiff).toBeLessThan(60000); // Less than 1 minute

    await memConnector.close();
  });

  it('should handle analytics queries (like test database)', { skip: !isAvailable }, async () => {
    const memConnector = new DuckDBConnector();
    await memConnector.connect({ filePath: ':memory:' });

    // Create analytics-style table
    await memConnector.query(`
      CREATE TABLE daily_metrics (
        metric_date DATE,
        total_value DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT current_timestamp
      )
    `);

    // Insert time-series data
    await memConnector.query(`
      INSERT INTO daily_metrics (metric_date, total_value) VALUES
      (current_date - INTERVAL '2 days', 1000.00),
      (current_date - INTERVAL '1 day', 1200.00),
      (current_date, 1100.00)
    `);

    // Query with aggregation (typical analytics query)
    const result = await memConnector.query<{ avg_value: number; total_days: number }>(`
      SELECT
        AVG(total_value) as avg_value,
        COUNT(*) as total_days
      FROM daily_metrics
      WHERE metric_date >= current_date - INTERVAL '7 days'
    `);

    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(1);
    expect(result[0].avg_value).toBeCloseTo(1100, 1); // Around 1100
    expect(result[0].total_days).toBe(3);

    await memConnector.close();
  });

  it('should handle connection errors gracefully', { skip: !isAvailable }, async () => {
    const badConnector = new DuckDBConnector();

    try {
      // Try to connect to a nonexistent file path
      await badConnector.connect({
        filePath: '/nonexistent/path/to/database.duckdb',
      });

      // If we get here, connection somehow succeeded (unexpected)
      const testResult = await badConnector.testConnection();
      expect(testResult.success).toBe(false);
    } catch (error) {
      // Expected: connection should fail
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/No such file|ENOENT|permission denied/i);
    } finally {
      // Clean up
      try {
        await badConnector.close();
      } catch {
        // Ignore cleanup errors
      }
    }
  });
});

describe('Connector Comparison Tests', () => {
  it('should have consistent interfaces', () => {
    const pgConnector = new PostgresConnector();
    const duckConnector = new DuckDBConnector();

    // Both should have the same public methods
    const pgMethods = Object.getOwnPropertyNames(PostgresConnector.prototype)
      .filter(name => name !== 'constructor' && !name.startsWith('_'));

    const duckMethods = Object.getOwnPropertyNames(DuckDBConnector.prototype)
      .filter(name => name !== 'constructor' && !name.startsWith('_'));

    expect(pgMethods.sort()).toEqual(duckMethods.sort());

    // Check specific required methods
    const requiredMethods = ['connect', 'testConnection', 'listTables', 'getTableMetadata', 'query', 'close'];

    for (const method of requiredMethods) {
      expect(pgConnector).toHaveProperty(method);
      expect(duckConnector).toHaveProperty(method);
      expect(typeof pgConnector[method]).toBe('function');
      expect(typeof duckConnector[method]).toBe('function');
    }
  });
});