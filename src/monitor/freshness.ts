/**
 * Freshness monitoring algorithm
 * Checks if data is stale based on last update timestamp
 *
 * @module @thias-se/freshguard-core/monitor/freshness
 */

import type { CheckResult, MonitoringRule } from '../types.js';
import type { Database } from '../db/index.js';
import { sql } from 'drizzle-orm';

/**
 * Check data freshness for a given rule
 *
 * @param db - Database connection
 * @param rule - Monitoring rule configuration
 * @returns CheckResult with freshness status
 */
export async function checkFreshness(
  db: Database,
  rule: MonitoringRule
): Promise<CheckResult> {
  const startTime = Date.now();
  const timestampColumn = rule.timestampColumn || 'updated_at';
  const toleranceMinutes = rule.toleranceMinutes || 60;

  try {
    // Execute query to get row count and max timestamp
    const query = sql`
      SELECT
        COUNT(*) as row_count,
        MAX(${sql.identifier(timestampColumn)}) as last_update
      FROM ${sql.identifier(rule.tableName)}
    `;

    const result = await db.execute(query);
    const row = result[0] as { row_count: string; last_update: Date | null };

    if (!row) {
      throw new Error('Query returned no results');
    }

    const rowCount = parseInt(row.row_count, 10);
    const lastUpdate = row.last_update;

    // If table is empty, return alert
    if (rowCount === 0) {
      return {
        status: 'alert',
        rowCount: 0,
        error: 'Table is empty',
        executionDurationMs: Date.now() - startTime,
        executedAt: new Date(),
      };
    }

    // If no timestamp found, return alert
    if (!lastUpdate) {
      return {
        status: 'alert',
        rowCount,
        error: `No timestamp found in column "${timestampColumn}"`,
        executionDurationMs: Date.now() - startTime,
        executedAt: new Date(),
      };
    }

    // Calculate lag in minutes
    const lagMs = Date.now() - new Date(lastUpdate).getTime();
    const lagMinutes = Math.floor(lagMs / 60000);

    // Determine status
    const isStale = lagMinutes > toleranceMinutes;

    return {
      status: isStale ? 'alert' : 'ok',
      rowCount,
      lastUpdate: new Date(lastUpdate),
      lagMinutes,
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
