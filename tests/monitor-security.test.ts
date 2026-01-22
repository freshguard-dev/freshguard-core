/**
 * Security tests for monitoring algorithms
 *
 * Tests the security measures implemented in freshness and volume monitoring:
 * - Input validation to prevent SQL injection
 * - Error sanitization to prevent information disclosure
 * - Timeout protection against DoS
 * - Parameter validation and range checks
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { checkFreshness } from '../src/monitor/freshness.js';
import { checkVolumeAnomaly } from '../src/monitor/volume.js';
import type { MonitoringRule } from '../src/types.js';
import type { Database } from '../src/db/index.js';

// Mock database for testing
const mockDb = {
  execute: async () => {
    throw new Error('Database connection failed - test error');
  }
} as Database;

// Valid rule template for testing
const validFreshnessRule: MonitoringRule = {
  id: 'test-rule-123',
  sourceId: 'test-source',
  name: 'Test Rule',
  tableName: 'users',
  ruleType: 'freshness',
  timestampColumn: 'updated_at',
  toleranceMinutes: 60,
  checkIntervalMinutes: 15,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validVolumeRule: MonitoringRule = {
  id: 'test-volume-rule-456',
  sourceId: 'test-source',
  name: 'Volume Test Rule',
  tableName: 'transactions',
  ruleType: 'volume_anomaly',
  baselineWindowDays: 30,
  deviationThresholdPercent: 20,
  minimumRowCount: 100,
  checkIntervalMinutes: 60,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Monitoring Algorithm Security', () => {
  describe('Freshness Monitoring Security', () => {
    it('should reject malicious table names', async () => {
      const maliciousRule = {
        ...validFreshnessRule,
        tableName: "users'; DROP TABLE admin; --"
      };

      const result = await checkFreshness(mockDb, maliciousRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Security validation failed');
    });

    it('should reject malicious column names', async () => {
      const maliciousRule = {
        ...validFreshnessRule,
        timestampColumn: "updated_at'; SELECT password FROM secrets; --"
      };

      const result = await checkFreshness(mockDb, maliciousRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Security validation failed');
    });

    it('should reject SQL injection in table names', async () => {
      const sqlInjectionTests = [
        "users) UNION SELECT password FROM admin WHERE (1=1",
        "users/**/UNION/**/SELECT/**/secret/**/FROM/**/vault",
        "users' OR '1'='1",
        "users; EXEC xp_cmdshell('dir'); --",
      ];

      for (const maliciousTable of sqlInjectionTests) {
        const maliciousRule = {
          ...validFreshnessRule,
          tableName: maliciousTable
        };

        const result = await checkFreshness(mockDb, maliciousRule);
        expect(result.status).toBe('failed');
        expect(result.error).not.toContain(maliciousTable); // Should not leak the malicious input
      }
    });

    it('should validate tolerance parameter ranges', async () => {
      const invalidTolerances = [0, -5, 20000]; // Outside 1-10080 range

      for (const tolerance of invalidTolerances) {
        const invalidRule = {
          ...validFreshnessRule,
          toleranceMinutes: tolerance
        };

        const result = await checkFreshness(mockDb, invalidRule);
        expect(result.status).toBe('failed');
        // Error message may be sanitized, so just check it failed
        expect(result.error).toBeDefined();
      }
    });

    it('should reject overly long identifiers', async () => {
      const longTableName = 'a'.repeat(300); // Exceeds 256 char limit
      const longColumnName = 'b'.repeat(300);

      const longTableRule = {
        ...validFreshnessRule,
        tableName: longTableName
      };

      const longColumnRule = {
        ...validFreshnessRule,
        timestampColumn: longColumnName
      };

      const tableResult = await checkFreshness(mockDb, longTableRule);
      expect(tableResult.status).toBe('failed');
      expect(tableResult.error).toContain('too long');

      const columnResult = await checkFreshness(mockDb, longColumnRule);
      expect(columnResult.status).toBe('failed');
      expect(columnResult.error).toContain('too long');
    });

    it('should sanitize error messages to prevent information disclosure', async () => {
      // Use a rule that will trigger the database error
      const result = await checkFreshness(mockDb, validFreshnessRule);

      expect(result.status).toBe('failed');
      expect(result.error).not.toContain('Database connection failed - test error');
      expect(result.error).not.toContain('test error');
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should validate rule type', async () => {
      const wrongTypeRule = {
        ...validFreshnessRule,
        ruleType: 'volume_anomaly' as any
      };

      const result = await checkFreshness(mockDb, wrongTypeRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Rule type must be "freshness"');
    });

    it('should reject null/undefined rules', async () => {
      const result1 = await checkFreshness(mockDb, null as any);
      expect(result1.status).toBe('failed');

      const result2 = await checkFreshness(mockDb, undefined as any);
      expect(result2.status).toBe('failed');
    });
  });

  describe('Volume Monitoring Security', () => {
    it('should reject malicious table names', async () => {
      const maliciousRule = {
        ...validVolumeRule,
        tableName: "transactions'; DROP TABLE users; --"
      };

      const result = await checkVolumeAnomaly(mockDb, maliciousRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Security validation failed');
    });

    it('should validate baseline window parameters', async () => {
      const invalidWindows = [0, -10, 400]; // Outside 1-365 range

      for (const window of invalidWindows) {
        const invalidRule = {
          ...validVolumeRule,
          baselineWindowDays: window
        };

        const result = await checkVolumeAnomaly(mockDb, invalidRule);
        expect(result.status).toBe('failed');
        expect(result.error).toBeDefined();
      }
    });

    it('should validate deviation threshold parameters', async () => {
      const invalidThresholds = [-5, 1500]; // Outside 0-1000 range

      for (const threshold of invalidThresholds) {
        const invalidRule = {
          ...validVolumeRule,
          deviationThresholdPercent: threshold
        };

        const result = await checkVolumeAnomaly(mockDb, invalidRule);
        expect(result.status).toBe('failed');
        expect(result.error).toBeDefined();
      }
    });

    it('should validate minimum row count parameters', async () => {
      const invalidMinimums = [-1, 'invalid' as any];

      for (const minimum of invalidMinimums) {
        const invalidRule = {
          ...validVolumeRule,
          minimumRowCount: minimum
        };

        const result = await checkVolumeAnomaly(mockDb, invalidRule);
        expect(result.status).toBe('failed');
        expect(result.error).toBeDefined();
      }
    });

    it('should validate rule type', async () => {
      const wrongTypeRule = {
        ...validVolumeRule,
        ruleType: 'freshness' as any
      };

      const result = await checkVolumeAnomaly(mockDb, wrongTypeRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Rule type must be "volume_anomaly"');
    });

    it('should require rule ID', async () => {
      const noIdRule = {
        ...validVolumeRule,
        id: ''
      };

      const result = await checkVolumeAnomaly(mockDb, noIdRule);
      expect(result.status).toBe('failed');
      expect(result.error).toContain('Rule ID is required');
    });

    it('should sanitize error messages', async () => {
      const result = await checkVolumeAnomaly(mockDb, validVolumeRule);

      expect(result.status).toBe('failed');
      expect(result.error).not.toContain('Database connection failed - test error');
      expect(result.error).not.toContain('test error');
      expect(result.error).toBeDefined();
    });

    it('should reject SQL injection patterns', async () => {
      const sqlInjectionTests = [
        "transactions) UNION SELECT credit_card FROM payments WHERE (1=1",
        "transactions/**/UNION/**/ALL/**/SELECT/**/*/**/FROM/**/secrets",
        "transactions' OR 'a'='a",
      ];

      for (const maliciousTable of sqlInjectionTests) {
        const maliciousRule = {
          ...validVolumeRule,
          tableName: maliciousTable
        };

        const result = await checkVolumeAnomaly(mockDb, maliciousRule);
        expect(result.status).toBe('failed');
        expect(result.error).not.toContain(maliciousTable);
      }
    });
  });

  describe('Security Consistency', () => {
    it('should always return CheckResult structure', async () => {
      const maliciousRule = {
        ...validFreshnessRule,
        tableName: "'; DROP TABLE users; --"
      };

      const freshnessResult = await checkFreshness(mockDb, maliciousRule);
      expect(freshnessResult).toHaveProperty('status');
      expect(freshnessResult).toHaveProperty('executedAt');
      expect(freshnessResult).toHaveProperty('executionDurationMs');
      expect(typeof freshnessResult.executionDurationMs).toBe('number');

      const volumeResult = await checkVolumeAnomaly(mockDb, {
        ...validVolumeRule,
        tableName: "'; DROP TABLE transactions; --"
      });
      expect(volumeResult).toHaveProperty('status');
      expect(volumeResult).toHaveProperty('executedAt');
      expect(volumeResult).toHaveProperty('executionDurationMs');
    });

    it('should never leak sensitive information in errors', async () => {
      const sensitiveTests = [
        { tableName: "users'; SELECT password FROM admin; --" },
        { tableName: "users) UNION SELECT credit_card FROM payments WHERE (1=1" },
      ];

      for (const testCase of sensitiveTests) {
        const freshnessRule = { ...validFreshnessRule, ...testCase };
        const volumeRule = { ...validVolumeRule, ...testCase };

        const freshnessResult = await checkFreshness(mockDb, freshnessRule);
        const volumeResult = await checkVolumeAnomaly(mockDb, volumeRule);

        // Should not contain SQL keywords or injection attempts
        expect(freshnessResult.error).not.toMatch(/SELECT|UNION|DROP|password|credit_card/i);
        expect(volumeResult.error).not.toMatch(/SELECT|UNION|DROP|password|credit_card/i);

        // Should not contain database version info
        expect(freshnessResult.error).not.toMatch(/PostgreSQL|MySQL|version|server/i);
        expect(volumeResult.error).not.toMatch(/PostgreSQL|MySQL|version|server/i);
      }
    });

    it('should have execution duration tracking for monitoring performance', async () => {
      const result = await checkFreshness(mockDb, validFreshnessRule);
      expect(result.executionDurationMs).toBeGreaterThanOrEqual(0);
      expect(result.executionDurationMs).toBeLessThan(5000); // Should be under 5 seconds for this test
      expect(typeof result.executionDurationMs).toBe('number');
    });
  });
});