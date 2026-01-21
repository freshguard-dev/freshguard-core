# Integration Tests for FreshGuard Core Connectors

This document explains how to run and understand the integration tests for FreshGuard database connectors.

## Overview

The integration tests (`tests/connectors.integration.test.ts`) verify that the PostgreSQL and DuckDB connectors work with real databases, not just mocked interfaces.

## Test Coverage

### PostgreSQL Connector Tests
- ✅ **Real database connection** - Connect to test PostgreSQL instance
- ✅ **Table listing** - List actual tables from test database
- ✅ **Metadata retrieval** - Get row counts and timestamps from real data
- ✅ **Query execution** - Run actual SQL queries
- ✅ **Freshness monitoring** - Test realistic freshness check queries
- ✅ **Volume anomaly detection** - Test realistic volume check queries
- ✅ **Error handling** - Test connection failures and invalid queries

### DuckDB Connector Tests
- ✅ **In-memory database** - Basic DuckDB functionality without files
- ✅ **Table creation and queries** - Create, insert, and query data
- ✅ **Analytics queries** - Test data warehouse style queries
- ✅ **Error handling** - Test file path errors and connection issues

### Cross-Connector Tests
- ✅ **Interface consistency** - Verify both connectors have identical APIs

## Running Tests

### Prerequisites

The integration tests can run in multiple modes depending on what's available:

1. **No external dependencies** - Runs 2 basic tests (connection errors, interface consistency)
2. **With Docker services** - Runs full PostgreSQL integration tests
3. **With DuckDB compiled** - Runs DuckDB integration tests

### Test Commands

```bash
# Run only unit tests (fast, no external dependencies)
pnpm test

# Run integration tests (may skip if databases unavailable)
pnpm test:integration

# Run all tests (unit + integration)
pnpm test:all

# Run tests with coverage (excluding integration)
pnpm test:coverage

# Run tests with coverage (including integration)
pnpm test:coverage:all
```

### Setup for Full Integration Testing

#### Option 1: Docker Services (Recommended)

Start the test databases:
```bash
# From project root
docker-compose up -d postgres_test duckdb_test

# Verify containers are running
docker ps | grep freshguard

# Run integration tests
cd packages/core
pnpm test:integration
```

The Docker setup provides:
- **PostgreSQL test database** on localhost:5433 with realistic e-commerce data
- **DuckDB test database** with analytics/warehouse style data

#### Option 2: Local Databases

If you prefer local databases, update the test configuration in `tests/connectors.integration.test.ts`:

```typescript
const TEST_CONFIG = {
  postgres: {
    host: 'localhost',
    port: 5432,           // Your local PostgreSQL port
    database: 'test_db',  // Your test database name
    username: 'your_user',
    password: 'your_password',
    sslMode: 'disable' as const,
  },
  // ...
};
```

## Test Data

### PostgreSQL Test Database

The test database contains realistic e-commerce schema:

- **customers** - Customer records with timestamps
- **orders** - Order data with fresh and stale records
- **products** - Product catalog
- **user_sessions** - Session data for volume anomaly testing
- **daily_summary** - Aggregated metrics for freshness testing

Data includes:
- ✅ **Recent data** (last few hours) for freshness testing
- ✅ **Historical data** (last few weeks) for volume baseline
- ✅ **Missing gaps** to test stale data detection
- ✅ **Volume variations** to test anomaly detection

### DuckDB Test Database

The DuckDB test contains analytics warehouse schema:

- **daily_summary** - Daily aggregated business metrics
- **customer_segments** - Customer segmentation data
- **hourly_traffic** - Traffic patterns for volume testing
- **etl_job_status** - ETL pipeline status tracking

## Test Behavior

### Graceful Degradation

The tests are designed to gracefully skip when external dependencies aren't available:

```bash
PostgreSQL test database not available. Skipping integration tests.
To run these tests: docker-compose up -d postgres_test

DuckDB not available. Skipping integration tests.
This is expected if DuckDB native bindings are not compiled.
```

This means:
- ✅ **CI/CD pipelines** can run tests without Docker
- ✅ **Developers** can run basic tests immediately
- ✅ **Full testing** is available when needed

### Test Results

#### All Tests Skipped (No Dependencies)
```
✓ tests/connectors.integration.test.ts (15 tests | 13 skipped)
```
- 2 tests run: interface consistency, error handling
- 13 tests skipped: all database-dependent tests

#### PostgreSQL Available
```
✓ tests/connectors.integration.test.ts (15 tests | 7 skipped)
```
- 8 tests run: all PostgreSQL integration tests
- 7 tests skipped: DuckDB tests only

#### Full Integration (Both Databases)
```
✓ tests/connectors.integration.test.ts (15 tests)
```
- All 15 tests run successfully

## Troubleshooting

### Common Issues

**"PostgreSQL test database not available"**
```bash
# Check if container is running
docker ps | grep postgres_test

# Start if needed
docker-compose up -d postgres_test

# Check logs if failing
docker logs freshguard_postgres_test
```

**"DuckDB not available"**
- This is expected in many environments due to native binding compilation issues
- See `packages/core/CLAUDE.md` > "DuckDB Native Binding Issues" for solutions
- Tests will gracefully skip DuckDB and test PostgreSQL only

**"Connection timeout"**
- Increase timeout in test configuration
- Check if Docker containers are healthy: `docker ps` (should show "healthy" status)
- Verify ports aren't in use: `lsof -i :5433`

### Performance Notes

- **Unit tests**: ~200ms (fast feedback loop)
- **Integration tests**: ~2-30s (depends on database startup time)
- **Full test suite**: Combines both for comprehensive validation

## Adding New Tests

When adding connector functionality, update integration tests:

1. **Add test cases** to `tests/connectors.integration.test.ts`
2. **Follow patterns** for graceful skipping
3. **Test real scenarios** that match production usage
4. **Include error cases** for robustness

Example pattern:
```typescript
it('should test new feature', { skip: !isConnected }, async () => {
  // Test implementation
  const result = await connector.newMethod();
  expect(result).toBeDefined();
});
```

The `{ skip: !isConnected }` ensures tests only run when databases are available.

## Coverage Reports

Integration tests contribute to overall coverage:

```bash
# Coverage excluding integration (for CI)
pnpm test:coverage

# Full coverage including integration (for comprehensive analysis)
pnpm test:coverage:all
```

This ensures both fast CI feedback and comprehensive testing capabilities.