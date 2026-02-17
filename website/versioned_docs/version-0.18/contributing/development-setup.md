---
sidebar_position: 1
---

# Development Setup

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL 12+ (for integration tests)
- Git

## Clone and install

```bash
git clone https://github.com/freshguard-dev/freshguard-core.git
cd freshguard-core
pnpm install
```

## Build and test

```bash
# Build
pnpm build

# Type check
pnpm type-check

# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run all pre-commit checks
pnpm pre-commit
```

## Integration tests

Integration tests run against real databases via Docker:

```bash
# Start test databases
pnpm test:services:start

# Wait for services, then run
pnpm test:integration:full

# Stop when done
pnpm test:services:stop
```

## What belongs in core

| Category | In scope | Out of scope |
|---|---|---|
| Monitoring | Freshness, volume, schema checks | Dashboard UI |
| Connectors | PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift | Proprietary databases |
| Alerting | Alert logic (when to fire) | Notification delivery (Slack, email) |
| CLI | Command-line tool | Web interface |
| Types | Single-tenant types | Multi-tenant (workspaceId, teamId) |
| Auth | None | Authentication, authorization |

If unsure whether a feature belongs, open an issue first.

## Pull request process

1. Fork and create a feature branch from `main`
2. Make changes following code standards (strict TypeScript, JSDoc on public APIs)
3. Add tests for new functionality
4. Run `pnpm pre-commit` (lint, build, type-check, coverage)
5. Submit PR with description of changes

All PRs run through GitHub Actions (lint, type-check, build, test coverage, multi-tenant contamination check).
