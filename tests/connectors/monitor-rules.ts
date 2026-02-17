/**
 * MonitoringRule factory functions for integration tests
 *
 * Each factory creates a minimal, valid MonitoringRule targeting the test
 * tables seeded by the init scripts (customers, products, orders, daily_summary, user_sessions).
 */

import type { MonitoringRule } from '../../src/types.js';

const now = new Date();

/** Creates a freshness rule — expects `updated_at` within 24 hours */
export function createFreshnessRule(table: string, column: string): MonitoringRule {
  return {
    id: `integ-freshness-${table}`,
    sourceId: 'integ-test',
    name: `Freshness: ${table}.${column}`,
    tableName: table,
    ruleType: 'freshness',
    timestampColumn: column,
    toleranceMinutes: 1440, // 24 hours
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Creates a volume anomaly rule — tolerant thresholds for test data */
export function createVolumeRule(table: string): MonitoringRule {
  return {
    id: `integ-volume-${table}`,
    sourceId: 'integ-test',
    name: `Volume: ${table}`,
    tableName: table,
    ruleType: 'volume_anomaly',
    deviationThresholdPercent: 50,
    minimumRowCount: 0,
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Creates a volume threshold rule — simple min/max bounds for test data */
export function createVolumeThresholdRule(table: string): MonitoringRule {
  return {
    id: `integ-volume-threshold-${table}`,
    sourceId: 'integ-test',
    name: `Volume Threshold: ${table}`,
    tableName: table,
    ruleType: 'volume_threshold',
    minRowThreshold: 1,          // test data has at least 1 row
    maxRowThreshold: 1_000_000,  // test data well under 1M rows
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

/** Creates a schema change rule — manual adaptation, full monitoring */
export function createSchemaRule(table: string): MonitoringRule {
  return {
    id: `integ-schema-${table}`,
    sourceId: 'integ-test',
    name: `Schema: ${table}`,
    tableName: table,
    ruleType: 'schema_change',
    trackColumnChanges: true,
    trackTableChanges: true,
    schemaChangeConfig: {
      adaptationMode: 'manual',
      monitoringMode: 'full',
    },
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}
