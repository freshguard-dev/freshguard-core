/**
 * Comprehensive Connector Integration Tests
 *
 * Exercises every connector through all Connector interface methods and all
 * three monitoring checks (freshness, volume, schema).
 *
 * Each connector is independently skippable — Docker connectors skip when the
 * service isn't reachable; cloud connectors skip when env vars are absent.
 *
 * Run:
 *   pnpm test:connectors            # run this file only
 *   pnpm test:connectors:docker     # start services, setup DuckDB, then run
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { CONNECTOR_REGISTRY } from './connector-registry.js';
import { createFreshnessRule, createVolumeRule, createVolumeThresholdRule, createSchemaRule } from './monitor-rules.js';
import { checkFreshness } from '../../src/monitor/freshness.js';
import { checkVolumeAnomaly } from '../../src/monitor/volume.js';
import { checkVolumeThreshold } from '../../src/monitor/volume-threshold.js';
import { checkSchemaChanges } from '../../src/monitor/schema-changes.js';
import type { Connector } from '../../src/types/connector.js';

const TIMEOUT = 30_000;

const EXPECTED_TABLES = ['customers', 'products', 'orders', 'daily_summary', 'user_sessions'];

/** Tracks per-connector results for the summary table */
interface ConnectorResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  detail: string;
  passedTests: number;
  failedTests: number;
}

const results: ConnectorResult[] = [];

// ── Per-connector test suite ────────────────────────────────────────

for (const entry of CONNECTOR_REGISTRY) {
  describe(`${entry.name} connector`, () => {
    let connector: Connector;
    let isConnected = false;

    beforeAll(async () => {
      if (!entry.isAvailable()) {
        console.warn(`⏭  ${entry.name}: ${entry.skipReason()}`);
        return;
      }

      try {
        connector = entry.createConnector();
        isConnected = await connector.testConnection();
        if (!isConnected) {
          console.warn(`⏭  ${entry.name}: testConnection() returned false`);
        }
      } catch (error) {
        console.warn(
          `⏭  ${entry.name}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
        isConnected = false;
      }
    }, TIMEOUT);

    afterAll(async () => {
      if (isConnected && connector) {
        try {
          await connector.close();
        } catch {
          // ignore cleanup errors
        }
      }
    });

    // Helper: skip if connector is not reachable
    function skipIfUnavailable() {
      if (!entry.isAvailable() || !isConnected) {
        return true;
      }
      return false;
    }

    // ── Connector interface methods ──────────────────────────────

    describe('Connector interface methods', () => {
      it('testConnection()', async () => {
        if (skipIfUnavailable()) return;
        const ok = await connector.testConnection();
        expect(ok).toBe(true);
      });

      it('listTables()', async () => {
        if (skipIfUnavailable()) return;
        const tables = await connector.listTables();
        expect(tables).toBeInstanceOf(Array);
        expect(tables.length).toBeGreaterThanOrEqual(EXPECTED_TABLES.length);
        // Some connectors (e.g. BigQuery) return dataset-qualified names like
        // "dataset.table" — extract just the last segment for comparison.
        const bareNames = tables.map((n) => n.split('.').pop()!.toLowerCase());
        for (const t of EXPECTED_TABLES) {
          expect(bareNames).toContain(t);
        }
      });

      it('getTableSchema("orders")', async () => {
        if (skipIfUnavailable()) return;
        const schema = await connector.getTableSchema('orders');
        expect(schema).toHaveProperty('table');
        expect(schema).toHaveProperty('columns');
        expect(schema.columns.length).toBeGreaterThan(0);

        const colNames = schema.columns.map((c) => c.name.toLowerCase());
        expect(colNames).toContain('updated_at');
      });

      it('getRowCount("orders")', async () => {
        if (skipIfUnavailable()) return;
        const count = await connector.getRowCount('orders');
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThan(0);
      });

      it('getMaxTimestamp("orders", "updated_at")', async () => {
        if (skipIfUnavailable()) return;
        const ts = await connector.getMaxTimestamp('orders', 'updated_at');
        expect(ts).toBeInstanceOf(Date);

        // Test data has timestamps within the last 24 hours
        const hoursDiff = (Date.now() - ts!.getTime()) / (1000 * 60 * 60);
        expect(hoursDiff).toBeLessThan(24);
      });

      it('getMinTimestamp("orders", "updated_at")', async () => {
        if (skipIfUnavailable()) return;
        const ts = await connector.getMinTimestamp('orders', 'updated_at');
        expect(ts).toBeInstanceOf(Date);
        expect(ts!.getTime()).toBeLessThanOrEqual(Date.now());
      });

      it('getLastModified("orders")', async () => {
        if (skipIfUnavailable()) return;
        try {
          const ts = await connector.getLastModified('orders');
          // Some connectors return a Date, others throw (base impl)
          if (ts !== null) {
            expect(ts).toBeInstanceOf(Date);
          }
        } catch (error) {
          // BaseConnector.getLastModified throws by default — this is expected
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    // ── Monitoring checks ────────────────────────────────────────

    describe('Monitoring checks', () => {
      it('checkFreshness()', async () => {
        if (skipIfUnavailable()) return;
        const rule = createFreshnessRule('orders', 'updated_at');
        const result = await checkFreshness(connector, rule);

        expect(result).toHaveProperty('status');
        // With 24h tolerance and test data < 24h old, should be ok
        expect(result.status).toBe('ok');
        expect(typeof result.lagMinutes).toBe('number');
        expect(result.lagMinutes).toBeDefined();
      });

      it('checkVolumeAnomaly()', async () => {
        if (skipIfUnavailable()) return;
        const rule = createVolumeRule('orders');
        const result = await checkVolumeAnomaly(connector, rule);

        expect(result).toHaveProperty('status');
        // First run without history returns 'ok' (pending baseline)
        expect(['ok', 'pending']).toContain(result.status);
        expect(typeof result.rowCount).toBe('number');
        expect(result.rowCount).toBeGreaterThan(0);
      });

      it('checkVolumeThreshold()', async () => {
        if (skipIfUnavailable()) return;
        const rule = createVolumeThresholdRule('orders');
        const result = await checkVolumeThreshold(connector, rule);

        expect(result).toHaveProperty('status');
        expect(result.status).toBe('ok');
        expect(typeof result.rowCount).toBe('number');
        expect(result.rowCount).toBeGreaterThan(0);
      });

      it('checkSchemaChanges()', async () => {
        if (skipIfUnavailable()) return;
        const rule = createSchemaRule('orders');
        const result = await checkSchemaChanges(connector, rule);

        expect(result).toHaveProperty('status');
        // First run captures baseline and returns ok
        expect(result.status).toBe('ok');
      });
    });

    // ── Track results per connector for summary ──────────────────

    afterEach((ctx) => {
      const connectorName = entry.name;
      let existing = results.find((r) => r.name === connectorName);
      if (!existing) {
        const status = !entry.isAvailable() || !isConnected ? 'skip' : 'pass';
        existing = {
          name: connectorName,
          status,
          detail: status === 'skip' ? entry.skipReason() : '',
          passedTests: 0,
          failedTests: 0,
        };
        results.push(existing);
      }

      if (!entry.isAvailable() || !isConnected) return;

      if (ctx.task.result?.state === 'pass') {
        existing.passedTests++;
      } else if (ctx.task.result?.state === 'fail') {
        existing.failedTests++;
        existing.status = 'fail';
        existing.detail = ctx.task.result?.errors?.[0]?.message ?? 'unknown failure';
      }
    });
  });
}

// ── Summary table ─────────────────────────────────────────────────

afterAll(() => {
  console.log('\n' + '═'.repeat(80));
  console.log('  Connector Integration Test Summary');
  console.log('═'.repeat(80));
  console.log(
    '  ' +
      'Connector'.padEnd(25) +
      'Status'.padEnd(10) +
      'Passed'.padEnd(10) +
      'Failed'.padEnd(10) +
      'Detail',
  );
  console.log('  ' + '─'.repeat(75));

  for (const r of results) {
    const icon = r.status === 'pass' ? '✅' : r.status === 'skip' ? '⏭ ' : '❌';
    console.log(
      `  ${icon} ${r.name.padEnd(23)}${r.status.padEnd(10)}${String(r.passedTests).padEnd(10)}${String(r.failedTests).padEnd(10)}${r.detail}`,
    );
  }

  // Also summarize connectors that never connected (weren't in results)
  for (const entry of CONNECTOR_REGISTRY) {
    if (!results.find((r) => r.name === entry.name)) {
      console.log(
        `  ⏭  ${entry.name.padEnd(23)}${'skip'.padEnd(10)}${'0'.padEnd(10)}${'0'.padEnd(10)}${entry.skipReason()}`,
      );
    }
  }

  console.log('═'.repeat(80) + '\n');
});
