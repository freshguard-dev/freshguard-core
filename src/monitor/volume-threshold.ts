/**
 * Simple volume threshold check
 * Alerts when row count falls below a minimum or exceeds a maximum threshold.
 *
 * Unlike `checkVolumeAnomaly` which compares against a historical baseline,
 * this performs a simple static bounds check — ideal for users who need
 * straightforward min/max row count monitoring.
 *
 * @module @freshguard/freshguard-core/monitor/volume-threshold
 * @license MIT
 */

import type { CheckResult, MonitoringRule, FreshGuardConfig } from '../types.js';
import type { Connector } from '../types/connector.js';
import { validateTableName } from '../validators/index.js';
import {
  TimeoutError,
  ConfigurationError,
  ErrorHandler,
} from '../errors/index.js';

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Check whether a table's row count is within the configured min/max thresholds.
 *
 * Returns `'alert'` when the row count is below `minRowThreshold` or above
 * `maxRowThreshold`. At least one threshold must be set on the rule.
 *
 * @param connector - Database connector instance
 * @param rule - Monitoring rule with `ruleType: 'volume_threshold'` and at least one of `minRowThreshold` / `maxRowThreshold`
 * @param config - Optional configuration including timeouts
 * @returns CheckResult with `status`, `rowCount`, and `message`
 *
 * @example
 * ```typescript
 * import { checkVolumeThreshold, PostgresConnector } from '@freshguard/freshguard-core';
 *
 * const connector = new PostgresConnector({ host: 'localhost', database: 'mydb', username: 'user', password: 'pass', ssl: true });
 * const rule = {
 *   id: 'r1', sourceId: 's1', name: 'Orders Volume',
 *   tableName: 'orders', ruleType: 'volume_threshold' as const,
 *   minRowThreshold: 100, maxRowThreshold: 10_000_000,
 *   checkIntervalMinutes: 60, isActive: true,
 *   createdAt: new Date(), updatedAt: new Date(),
 * };
 * const result = await checkVolumeThreshold(connector, rule);
 * console.log(result.status, result.rowCount);
 * ```
 *
 * @since 0.3.0
 */
export async function checkVolumeThreshold(
  connector: Connector,
  rule: MonitoringRule,
  config?: FreshGuardConfig,
): Promise<CheckResult> {
  const startTime = process.hrtime.bigint();

  try {
    validateThresholdRule(rule);
    validateTableName(rule.tableName);

    const timeoutMs = config?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    const rowCount = await executeWithTimeout(
      () => connector.getRowCount(rule.tableName),
      timeoutMs,
      'Volume threshold row count query timeout',
    );

    if (isNaN(rowCount) || rowCount < 0) {
      throw new ConfigurationError('Invalid row count returned from connector');
    }

    if (rowCount > Number.MAX_SAFE_INTEGER) {
      throw new ConfigurationError('Row count exceeds safe integer limit');
    }

    const executionDurationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    const executedAt = new Date();

    // Check thresholds
    if (rule.minRowThreshold != null && rowCount < rule.minRowThreshold) {
      return {
        status: 'alert',
        rowCount,
        executionDurationMs,
        executedAt,
        error: `Row count ${rowCount} is below minimum threshold ${rule.minRowThreshold}`,
      };
    }

    if (rule.maxRowThreshold != null && rowCount > rule.maxRowThreshold) {
      return {
        status: 'alert',
        rowCount,
        executionDurationMs,
        executedAt,
        error: `Row count ${rowCount} exceeds maximum threshold ${rule.maxRowThreshold}`,
      };
    }

    return {
      status: 'ok',
      rowCount,
      executionDurationMs,
      executedAt,
    };
  } catch (error) {
    const userMessage = ErrorHandler.getUserMessage(error);
    const executionDurationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    return {
      status: 'failed',
      error: userMessage,
      executionDurationMs,
      executedAt: new Date(),
    };
  }
}

/**
 * Validate that the rule is correctly configured for volume threshold checks.
 */
function validateThresholdRule(rule: MonitoringRule): void {
  if (!rule) {
    throw new ConfigurationError('Monitoring rule is required');
  }

  if (!rule.id || typeof rule.id !== 'string') {
    throw new ConfigurationError('Rule ID is required and must be a string');
  }

  if (!rule.tableName || typeof rule.tableName !== 'string') {
    throw new ConfigurationError('Table name is required and must be a string');
  }

  if (rule.tableName.length > 256) {
    throw new ConfigurationError('Table name too long (max 256 characters)');
  }

  if (rule.ruleType !== 'volume_threshold') {
    throw new ConfigurationError('Rule type must be "volume_threshold" for volume threshold checks');
  }

  const hasMin = rule.minRowThreshold != null;
  const hasMax = rule.maxRowThreshold != null;

  if (!hasMin && !hasMax) {
    throw new ConfigurationError('At least one of minRowThreshold or maxRowThreshold must be set');
  }

  if (hasMin) {
    if (typeof rule.minRowThreshold !== 'number' || !Number.isInteger(rule.minRowThreshold) || rule.minRowThreshold < 0) {
      throw new ConfigurationError('minRowThreshold must be a non-negative integer');
    }
  }

  if (hasMax) {
    if (typeof rule.maxRowThreshold !== 'number' || !Number.isInteger(rule.maxRowThreshold) || rule.maxRowThreshold < 0) {
      throw new ConfigurationError('maxRowThreshold must be a non-negative integer');
    }
  }

  if (hasMin && hasMax && rule.minRowThreshold! > rule.maxRowThreshold!) {
    throw new ConfigurationError('minRowThreshold cannot be greater than maxRowThreshold');
  }
}

/**
 * Execute operation with timeout protection
 */
async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError(timeoutMessage, 'volume_threshold_check', timeoutMs));
    }, timeoutMs);

    operation()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}
