/**
 * Volume anomaly detection algorithm
 * Detects when row counts deviate significantly from historical baseline
 *
 * @module @thias-se/freshguard-core/monitor/volume
 */

import type { CheckResult, MonitoringRule } from '../types.js';
import type { Database } from '../db/index.js';
import { sql, desc } from 'drizzle-orm';
import { checkExecutions } from '../db/schema.js';

/**
 * Check volume anomaly for a given rule
 *
 * @param db - Database connection
 * @param rule - Monitoring rule configuration
 * @returns CheckResult with volume anomaly status
 */
export async function checkVolumeAnomaly(
  db: Database,
  rule: MonitoringRule
): Promise<CheckResult> {
  const startTime = Date.now();
  const baselineWindowDays = rule.baselineWindowDays || 30;
  const deviationThresholdPercent = rule.deviationThresholdPercent || 20;
  const minimumRowCount = rule.minimumRowCount || 0;

  try {
    // Get current row count
    const countQuery = sql`SELECT COUNT(*) as row_count FROM ${sql.identifier(rule.tableName)}`;
    const countResult = await db.execute(countQuery);
    const currentRowCount = parseInt((countResult[0] as { row_count: string }).row_count, 10);

    // Skip check if below minimum threshold
    if (currentRowCount < minimumRowCount) {
      return {
        status: 'ok',
        rowCount: currentRowCount,
        executionDurationMs: Date.now() - startTime,
        executedAt: new Date(),
      };
    }

    // Get historical row counts from previous executions
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - baselineWindowDays);

    const historicalData = await db
      .select({
        rowCount: checkExecutions.rowCount,
      })
      .from(checkExecutions)
      .where(
        sql`${checkExecutions.ruleId} = ${rule.id} AND ${checkExecutions.executedAt} >= ${cutoffDate} AND ${checkExecutions.status} = 'ok' AND ${checkExecutions.rowCount} IS NOT NULL`
      )
      .orderBy(desc(checkExecutions.executedAt))
      .limit(100);

    // If not enough historical data, return ok (can't determine baseline yet)
    if (historicalData.length < 3) {
      return {
        status: 'ok',
        rowCount: currentRowCount,
        deviation: 0,
        baselineAverage: currentRowCount,
        executionDurationMs: Date.now() - startTime,
        executedAt: new Date(),
      };
    }

    // Calculate baseline statistics
    const historicalCounts = historicalData.map((h) => Number(h.rowCount));
    const mean = historicalCounts.reduce((a, b) => a + b, 0) / historicalCounts.length;

    // Calculate deviation percentage from mean
    const deviationPercent = mean > 0 ? Math.abs(((currentRowCount - mean) / mean) * 100) : 0;

    // Determine if this is an anomaly
    const isAnomaly = deviationPercent > deviationThresholdPercent;

    return {
      status: isAnomaly ? 'alert' : 'ok',
      rowCount: currentRowCount,
      deviation: Math.round(deviationPercent * 100) / 100,
      baselineAverage: Math.round(mean),
      executionDurationMs: Date.now() - startTime,
      executedAt: new Date(),
    };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionDurationMs: Date.now() - startTime,
      executedAt: new Date(),
    };
  }
}
