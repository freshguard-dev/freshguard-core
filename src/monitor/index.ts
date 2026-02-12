/**
 * Monitoring algorithms for data pipeline health checks
 *
 * Three complementary checks cover the most common data-quality failure modes:
 *
 * | Function               | Detects                                      |
 * |------------------------|----------------------------------------------|
 * | `checkFreshness`       | Stale data — table not updated within SLA     |
 * | `checkVolumeAnomaly`   | Row-count spikes or drops vs. historical baseline |
 * | `checkSchemaChanges`   | Added, removed, or modified columns           |
 *
 * All three accept a {@link Connector} and a {@link MonitoringRule}, returning
 * a {@link CheckResult} with `status: 'ok' | 'alert' | 'failed'`.
 *
 * @example
 * ```typescript
 * import {
 *   checkFreshness,
 *   checkVolumeAnomaly,
 *   checkSchemaChanges,
 * } from '@freshguard/freshguard-core';
 *
 * const freshness = await checkFreshness(connector, rule);
 * const volume    = await checkVolumeAnomaly(connector, rule);
 * const schema    = await checkSchemaChanges(connector, rule);
 * ```
 *
 * @module @freshguard/freshguard-core/monitor
 */

export { checkFreshness } from './freshness.js';
export { checkVolumeAnomaly } from './volume.js';
export { checkSchemaChanges } from './schema-changes.js';
export { SchemaBaselineManager, SchemaComparer } from './schema-baseline.js';
