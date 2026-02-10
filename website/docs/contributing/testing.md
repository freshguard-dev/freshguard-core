---
sidebar_position: 4
---

# Testing

## Running tests

```bash
# All tests
pnpm test

# With coverage
pnpm test:coverage

# Watch mode during development
pnpm test -- --watch

# Specific file
pnpm test -- freshness.test.ts

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration
```

## Test structure

Tests live in `tests/` and use Vitest:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkFreshness } from '../src/monitor/freshness.js';

describe('checkFreshness', () => {
  it('should return ok when data is fresh', async () => {
    // arrange
    // act
    // assert
  });

  it('should return alert when data is stale', async () => {
    // ...
  });
});
```

## Integration tests

Integration tests run against real databases via Docker:

```bash
# Start test databases
pnpm test:services:start

# Run all tests including integration
pnpm test:integration:full

# Stop
pnpm test:services:stop
```

## What to test

For monitoring algorithms:
- Happy path (alert and ok conditions)
- Edge cases (empty tables, null timestamps, zero rows)
- Error handling (invalid config, connection failures)
- Configuration validation

For connectors:
- Connection lifecycle (connect, query, close)
- All interface methods (listTables, getRowCount, etc.)
- SQL injection prevention
- Error sanitization
- Timeout behavior

## Coverage

```bash
pnpm test:coverage
```

Coverage reports are generated in `coverage/` (text, JSON, HTML formats). The CI pipeline verifies coverage on every PR.
