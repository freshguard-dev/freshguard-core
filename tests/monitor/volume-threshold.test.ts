/**
 * Tests for volume threshold monitoring
 *
 * Tests the checkVolumeThreshold function including:
 * - Min threshold alerting
 * - Max threshold alerting
 * - Both thresholds combined
 * - OK status within bounds
 * - Validation and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkVolumeThreshold } from '../../src/monitor/volume-threshold.js';
import type { MonitoringRule } from '../../src/types.js';
import type { Connector } from '../../src/types/connector.js';

const mockConnector: Connector = {
  testConnection: vi.fn().mockResolvedValue(true),
  listTables: vi.fn(),
  getTableSchema: vi.fn(),
  getRowCount: vi.fn(),
  getMaxTimestamp: vi.fn(),
  getMinTimestamp: vi.fn(),
  getLastModified: vi.fn(),
  close: vi.fn(),
};

vi.mock('../../src/validators/index.js', () => ({
  validateTableName: vi.fn(),
}));

const baseRule: MonitoringRule = {
  id: 'test-threshold-rule',
  sourceId: 'test-source',
  name: 'Volume Threshold Test',
  tableName: 'test_table',
  ruleType: 'volume_threshold',
  minRowThreshold: 100,
  maxRowThreshold: 10_000_000,
  checkIntervalMinutes: 60,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('checkVolumeThreshold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockConnector.getRowCount).mockResolvedValue(1000);
  });

  describe('OK status', () => {
    it('should return ok when row count is within bounds', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(5000);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('ok');
      expect(result.rowCount).toBe(5000);
      expect(result.executionDurationMs).toBeGreaterThanOrEqual(0);
      expect(result.executedAt).toBeInstanceOf(Date);
    });

    it('should return ok when row count equals minRowThreshold', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(100);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('ok');
      expect(result.rowCount).toBe(100);
    });

    it('should return ok when row count equals maxRowThreshold', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(10_000_000);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('ok');
      expect(result.rowCount).toBe(10_000_000);
    });
  });

  describe('Min threshold alerting', () => {
    it('should alert when row count is below minRowThreshold', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(50);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('alert');
      expect(result.rowCount).toBe(50);
      expect(result.error).toBe('Row count 50 is below minimum threshold 100');
    });

    it('should alert with only minRowThreshold set', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        maxRowThreshold: undefined,
        minRowThreshold: 500,
      };

      vi.mocked(mockConnector.getRowCount).mockResolvedValue(200);

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('alert');
      expect(result.rowCount).toBe(200);
      expect(result.error).toContain('below minimum threshold 500');
    });

    it('should alert when row count is zero', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(0);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('alert');
      expect(result.rowCount).toBe(0);
    });
  });

  describe('Max threshold alerting', () => {
    it('should alert when row count exceeds maxRowThreshold', async () => {
      vi.mocked(mockConnector.getRowCount).mockResolvedValue(20_000_000);

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('alert');
      expect(result.rowCount).toBe(20_000_000);
      expect(result.error).toBe('Row count 20000000 exceeds maximum threshold 10000000');
    });

    it('should alert with only maxRowThreshold set', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        minRowThreshold: undefined,
        maxRowThreshold: 1000,
      };

      vi.mocked(mockConnector.getRowCount).mockResolvedValue(5000);

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('alert');
      expect(result.rowCount).toBe(5000);
      expect(result.error).toContain('exceeds maximum threshold 1000');
    });
  });

  describe('Validation', () => {
    it('should fail when ruleType is not volume_threshold', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        ruleType: 'freshness',
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('volume_threshold');
    });

    it('should fail when neither threshold is set', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        minRowThreshold: undefined,
        maxRowThreshold: undefined,
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('At least one');
    });

    it('should fail when minRowThreshold is greater than maxRowThreshold', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        minRowThreshold: 1000,
        maxRowThreshold: 100,
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('cannot be greater than');
    });

    it('should fail when minRowThreshold is negative', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        minRowThreshold: -1,
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('non-negative');
    });

    it('should fail when tableName is missing', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        tableName: '',
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
    });

    it('should fail when rule ID is missing', async () => {
      const rule: MonitoringRule = {
        ...baseRule,
        id: '',
      };

      const result = await checkVolumeThreshold(mockConnector, rule);

      expect(result.status).toBe('failed');
    });
  });

  describe('Error handling', () => {
    it('should handle connector errors gracefully', async () => {
      vi.mocked(mockConnector.getRowCount).mockRejectedValue(new Error('Connection lost'));

      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
      expect(result.executionDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('should handle timeout', async () => {
      vi.mocked(mockConnector.getRowCount).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(1000), 5000)),
      );

      const result = await checkVolumeThreshold(mockConnector, baseRule, {
        timeoutMs: 100,
        sources: {},
        rules: [],
      });

      expect(result.status).toBe('failed');
      expect(result.error).toContain('timeout');
    });
  });

  describe('Execution metadata', () => {
    it('should track execution duration', async () => {
      const result = await checkVolumeThreshold(mockConnector, baseRule);

      expect(result.executionDurationMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.executionDurationMs).toBe('number');
    });

    it('should set executedAt timestamp', async () => {
      const before = new Date();
      const result = await checkVolumeThreshold(mockConnector, baseRule);
      const after = new Date();

      expect(result.executedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.executedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
