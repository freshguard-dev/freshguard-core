/**
 * Tests for package exports
 * Verifies that the public API is properly exported
 */

import { describe, it, expect } from 'vitest';

describe('Package Exports', () => {
  it('should export checkFreshness function', async () => {
    const { checkFreshness } = await import('../src/monitor/freshness.js');
    expect(checkFreshness).toBeDefined();
    expect(typeof checkFreshness).toBe('function');
  });

  it('should export checkVolumeAnomaly function', async () => {
    const { checkVolumeAnomaly } = await import('../src/monitor/volume.js');
    expect(checkVolumeAnomaly).toBeDefined();
    expect(typeof checkVolumeAnomaly).toBe('function');
  });

  it('should export PostgresConnector class', async () => {
    const { PostgresConnector } = await import('../src/connectors/postgres.js');
    expect(PostgresConnector).toBeDefined();
    expect(typeof PostgresConnector).toBe('function');
  });

  // Skip DuckDB test until native bindings are properly compiled
  it.skip('should export DuckDBConnector class', async () => {
    // Skipped: DuckDB native bindings not available
    // const { DuckDBConnector } = await import('../src/connectors/duckdb.js');
    // expect(DuckDBConnector).toBeDefined();
    // expect(typeof DuckDBConnector).toBe('function');
  });

  it('should export createDatabase function', async () => {
    const { createDatabase } = await import('../src/db/index.js');
    expect(createDatabase).toBeDefined();
    expect(typeof createDatabase).toBe('function');
  });

  it('should export schema object', async () => {
    const { schema } = await import('../src/db/index.js');
    expect(schema).toBeDefined();
    expect(typeof schema).toBe('object');
  });
});
