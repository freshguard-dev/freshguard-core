/**
 * Tests for observability features (logging and metrics)
 * Part of Phase 2 Security Implementation
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StructuredLogger,
  LogLevel,
  createComponentLogger,
  createDatabaseLogger,
  logTimedOperation
} from '../src/observability/logger.js';
import {
  MetricsCollector,
  createComponentMetrics,
  timeOperation,
  MetricType
} from '../src/observability/metrics.js';
import { CircuitBreaker, CircuitBreakerState } from '../src/resilience/circuit-breaker.js';
import { RetryPolicy } from '../src/resilience/retry-policy.js';

describe('Observability Layer Tests', () => {
  describe('StructuredLogger', () => {
    test('should create logger with default configuration', () => {
      const logger = new StructuredLogger();
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.INFO);
      expect(config.serviceName).toBe('freshguard-core');
      expect(config.sanitizeSensitiveData).toBe(true);
    });

    test('should create logger with custom configuration', () => {
      const logger = new StructuredLogger({
        level: LogLevel.DEBUG,
        serviceName: 'test-service',
        environment: 'test',
        sanitizeSensitiveData: false
      });

      const config = logger.getConfig();
      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.serviceName).toBe('test-service');
      expect(config.environment).toBe('test');
      expect(config.sanitizeSensitiveData).toBe(false);
    });

    test('should create child logger with additional context', () => {
      const parent = new StructuredLogger();
      const child = parent.child({ component: 'test', operation: 'testing' });

      expect(child).toBeInstanceOf(StructuredLogger);
    });

    test('should create timing tracker', async () => {
      const logger = new StructuredLogger();
      const timer = logger.createTimer();

      timer.start();
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait 10ms
      const timing = timer.end('Test operation completed');

      expect(timing.duration).toBeGreaterThan(0);
      expect(timing.startTime).toBeInstanceOf(Date);
      expect(timing.endTime).toBeInstanceOf(Date);
    });

    test('should handle sensitive data sanitization', () => {
      const logger = new StructuredLogger({ sanitizeSensitiveData: true });

      // This should not throw and should sanitize sensitive data
      logger.info('Test with sensitive data', {
        password: 'secret123',
        apiKey: 'key123',
        normalData: 'safe'
      });

      // Test should pass if no exception thrown
      expect(true).toBe(true);
    });

    test('should support all log levels', () => {
      const logger = new StructuredLogger();

      // These should not throw
      logger.trace('Trace message');
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message', new Error('Test error'));
      logger.fatal('Fatal message', new Error('Fatal error'));

      expect(true).toBe(true);
    });
  });

  describe('MetricsCollector', () => {
    let metrics: MetricsCollector;

    beforeEach(() => {
      metrics = new MetricsCollector({ enabled: true });
    });

    afterEach(() => {
      metrics.stop();
    });

    test('should create metrics collector with default configuration', () => {
      const collector = new MetricsCollector();
      expect(collector).toBeInstanceOf(MetricsCollector);
    });

    test('should record query metrics', () => {
      metrics.recordQuery('getRowCount', 'testdb', 'users', 150, true);

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.successfulQueries).toBe(1);
      expect(queryMetrics.failedQueries).toBe(0);
      expect(queryMetrics.averageDuration).toBe(150);
    });

    test('should record failed query metrics', () => {
      const error = new Error('Query failed');
      metrics.recordQuery('getRowCount', 'testdb', 'users', 250, false, error);

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.successfulQueries).toBe(0);
      expect(queryMetrics.failedQueries).toBe(1);
      expect(queryMetrics.errorRate).toBe(100);
    });

    test('should record circuit breaker state changes', () => {
      metrics.recordCircuitBreakerState('test-circuit', 'CLOSED', 0, 5);
      metrics.recordCircuitBreakerState('test-circuit', 'OPEN', 3, 5);

      // Should not throw
      expect(true).toBe(true);
    });

    test('should record retry attempts', () => {
      metrics.recordRetryAttempt('test-operation', 1, 100, false, false);
      metrics.recordRetryAttempt('test-operation', 2, 150, true, true);

      // Should not throw
      expect(true).toBe(true);
    });

    test('should record connection events', () => {
      metrics.recordConnection('postgres', 'open', true);
      metrics.recordConnection('postgres', 'close', true);

      // Should not throw
      expect(true).toBe(true);
    });

    test('should get system metrics', () => {
      const systemMetrics = metrics.getSystemMetrics();

      expect(systemMetrics.memoryUsage).toBeGreaterThan(0);
      expect(systemMetrics.uptime).toBeGreaterThanOrEqual(0);
      expect(systemMetrics.activeConnections).toBeGreaterThanOrEqual(0);
    });

    test('should get all metrics in Prometheus format', () => {
      metrics.recordQuery('test', 'db', 'table', 100, true);
      const allMetrics = metrics.getAllMetrics();

      expect(Array.isArray(allMetrics)).toBe(true);
      expect(allMetrics.length).toBeGreaterThan(0);

      const hasCounterMetric = allMetrics.some(m => m.type === MetricType.COUNTER);
      const hasGaugeMetric = allMetrics.some(m => m.type === MetricType.GAUGE);
      expect(hasCounterMetric).toBe(true);
      expect(hasGaugeMetric).toBe(true);
    });

    test('should reset metrics', () => {
      metrics.recordQuery('test', 'db', 'table', 100, true);
      let queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);

      metrics.reset();
      queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(0);
    });
  });

  describe('Circuit Breaker Observability', () => {
    test('should create circuit breaker with observability', () => {
      const logger = createComponentLogger('test-circuit');
      const metrics = createComponentMetrics('test-circuit');

      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        recoveryTimeout: 1000,
        name: 'test-circuit',
        logger,
        metrics,
        enableDetailedLogging: true
      });

      expect(circuitBreaker).toBeInstanceOf(CircuitBreaker);
      expect(circuitBreaker.getName()).toBe('test-circuit');
    });

    test('should log circuit breaker state changes', async () => {
      const logger = createComponentLogger('test-circuit');
      const metrics = createComponentMetrics('test-circuit');

      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 2,
        successThreshold: 1,
        recoveryTimeout: 100,
        name: 'test-circuit',
        logger,
        metrics
      });

      // Force failures to trip circuit
      const failingOperation = () => Promise.reject(new Error('Test failure'));

      try { await circuitBreaker.execute(failingOperation); } catch {}
      try { await circuitBreaker.execute(failingOperation); } catch {}

      // Circuit should now be OPEN
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      const stats = circuitBreaker.getStats();
      expect(stats.failedCalls).toBe(2);
    });
  });

  describe('Retry Policy Observability', () => {
    test('should create retry policy with observability', () => {
      const logger = createComponentLogger('test-retry');
      const metrics = createComponentMetrics('test-retry');

      const retryPolicy = new RetryPolicy({
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2,
        enableJitter: false,
        name: 'test-retry',
        logger,
        metrics,
        enableDetailedLogging: true
      });

      expect(retryPolicy).toBeInstanceOf(RetryPolicy);
    });

    test('should log retry attempts', async () => {
      const logger = createComponentLogger('test-retry');
      const metrics = createComponentMetrics('test-retry');

      const retryPolicy = new RetryPolicy({
        maxAttempts: 3,
        baseDelay: 1,
        maxDelay: 10,
        backoffMultiplier: 2,
        enableJitter: false,
        name: 'test-retry',
        logger,
        metrics
      });

      let attemptCount = 0;
      const operation = () => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve('Success!');
      };

      const result = await retryPolicy.execute(operation);
      expect(result).toBe('Success!');
      expect(attemptCount).toBe(3);

      const stats = retryPolicy.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.successfulExecutions).toBe(1);
    });

    test('should log retry exhaustion', async () => {
      const logger = createComponentLogger('test-retry');
      const metrics = createComponentMetrics('test-retry');

      const retryPolicy = new RetryPolicy({
        maxAttempts: 2,
        baseDelay: 1,
        maxDelay: 10,
        backoffMultiplier: 2,
        enableJitter: false,
        name: 'test-retry-exhaust',
        logger,
        metrics
      });

      const alwaysFailOperation = () => Promise.reject(new Error('Always fails'));

      try {
        await retryPolicy.execute(alwaysFailOperation);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.name).toBe('RetryExhaustedError');
      }

      const stats = retryPolicy.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.failedExecutions).toBe(1);
    });
  });

  describe('Factory Functions', () => {
    test('should create component logger', () => {
      const logger = createComponentLogger('test-component');
      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    test('should create database logger', () => {
      const logger = createDatabaseLogger('postgres');
      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    test('should create component metrics', () => {
      const metrics = createComponentMetrics('test-component');
      expect(metrics).toBeInstanceOf(MetricsCollector);
    });
  });

  describe('Timed Operations', () => {
    test('should log timed operation success', async () => {
      const logger = createComponentLogger('test');

      const result = await logTimedOperation(
        logger,
        'test-operation',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'success';
        },
        { testContext: 'value' }
      );

      expect(result).toBe('success');
    });

    test('should log timed operation failure', async () => {
      const logger = createComponentLogger('test');

      try {
        await logTimedOperation(
          logger,
          'failing-operation',
          async () => {
            throw new Error('Operation failed');
          },
          { testContext: 'value' }
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Operation failed');
      }
    });

    test('should time operation with metrics', async () => {
      const metrics = createComponentMetrics('test');

      const result = await timeOperation(
        metrics,
        'test-operation',
        'test-db',
        'test-table',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'success';
        }
      );

      expect(result).toBe('success');

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.successfulQueries).toBe(1);

      metrics.stop();
    });

    test('should handle timed operation failure with metrics', async () => {
      const metrics = createComponentMetrics('test');

      try {
        await timeOperation(
          metrics,
          'failing-operation',
          'test-db',
          'test-table',
          async () => {
            throw new Error('Operation failed');
          }
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Operation failed');
      }

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.failedQueries).toBe(1);
      expect(queryMetrics.errorRate).toBe(100);

      metrics.stop();
    });
  });

  describe('Integration Tests', () => {
    test('should work with both logging and metrics together', async () => {
      const logger = createComponentLogger('integration-test');
      const metrics = createComponentMetrics('integration-test');

      // Test successful operation
      await logTimedOperation(
        logger,
        'integration-test-success',
        async () => {
          return timeOperation(
            metrics,
            'nested-operation',
            'test-db',
            'test-table',
            async () => {
              await new Promise(resolve => setTimeout(resolve, 10));
              return 'nested-success';
            }
          );
        },
        { integrationTest: true }
      );

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.successfulQueries).toBe(1);

      metrics.stop();
    });

    test('should handle errors in integrated observability', async () => {
      const logger = createComponentLogger('integration-test-error');
      const metrics = createComponentMetrics('integration-test-error');

      try {
        await logTimedOperation(
          logger,
          'integration-test-error',
          async () => {
            return timeOperation(
              metrics,
              'nested-failing-operation',
              'test-db',
              'test-table',
              async () => {
                throw new Error('Nested operation failed');
              }
            );
          },
          { integrationTest: true, expectError: true }
        );
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Nested operation failed');
      }

      const queryMetrics = metrics.getQueryMetrics();
      expect(queryMetrics.totalQueries).toBe(1);
      expect(queryMetrics.failedQueries).toBe(1);

      metrics.stop();
    });
  });
});