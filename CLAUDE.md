# CLAUDE.md - FreshGuard Open Core (Public Repository)

**Project**: FreshGuard Open Source Core  
**Repository**: github.com/freshguard/freshguard  
**License**: MIT  
**Audience**: Self-hosters, developers, open-source contributors  

---

## Project Overview

**What This Is**:
- Open-source data pipeline freshness monitoring engine
- MIT-licensed core library
- Target: SMBs who want to self-host FreshGuard

**What This Is NOT**:
- NOT the full SaaS product (see github.com/YOUR-ACCOUNT/freshguard-cloud for that)
- NOT multi-tenant (Cloud handles that)
- NOT proprietary (this is open source for anyone)

**Important**: This is ONLY the core monitoring logic. The multi-tenant SaaS lives in a separate, private repository. See [LICENSE_CLARIFICATION.md](docs/LICENSE_CLARIFICATION.md) for details.

---

## Repository Structure

```
freshguard-core/  (PUBLIC)
├── src/                         # ✅ MIT - Core Source Code
│   ├── connectors/              # Database drivers
│   │   ├── postgres.ts          # PostgreSQL
│   │   ├── duckdb.ts            # DuckDB
│   │   └── index.ts             # Public exports
│   ├── monitor/                 # Core algorithms
│   │   ├── freshness.ts         # Freshness checking
│   │   ├── volume.ts            # Volume anomaly
│   │   └── index.ts             # Exports
│   ├── db/                      # Database schema (Drizzle)
│   │   ├── schema.ts            # Table definitions
│   │   ├── migrations/          # SQL migrations
│   │   └── index.ts             # Exports
│   ├── cli/                     # CLI for self-hosters
│   │   └── index.ts
│   ├── types.ts                 # Type definitions
│   └── index.ts                 # PUBLIC API
├── tests/                       # Test files
├── dist/                        # Build output
├── docs/
│   ├── SELF_HOSTING.md          # How to self-host
│   ├── CONTRIBUTING.md          # Developer guide
│   ├── LICENSE_CLARIFICATION.md # Open core explanation
│   └── ARCHITECTURE.md          # Technical details
├── .github/
│   └── workflows/
│       ├── core-test.yml        # Test on push
│       └── publish-npm.yml      # Publish on release
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript config
├── vitest.config.ts             # Test configuration
├── README.md                    # Quick start
├── LICENSE                      # MIT license
└── CLAUDE.md                    # This file
```

**Key Rules**:
- ✅ Everything in `packages/` is MIT licensed
- ✅ Everything is open source (contributors can read/modify)
- ✅ No proprietary code or closed-source logic
- ✅ Self-hosters can use this directly
- ❌ NO multi-tenant features
- ❌ NO authentication/authorization (SaaS handles this)
- ❌ NO UI dashboard (SaaS has that)
- ❌ NO billing logic

---

## What Belongs Here vs. Private Cloud

### ✅ Add to Core (MIT)
- Database connectors (PostgreSQL, DuckDB, etc.)
- Monitoring algorithms (freshness, volume, etc.)
- Alerting logic (when to alert)
- Query execution
- CLI tool
- Documentation

### ❌ NEVER Add to Core
- Multi-tenant orchestration
- User authentication
- Team/workspace management
- Dashboard UI
- Billing
- Usage tracking

---

## Tech Stack

**Language**: TypeScript 5.3+  
**Package Manager**: pnpm  
**Database**: PostgreSQL (schema), DuckDB (query)  
**ORM**: Drizzle ORM  
**Testing**: Vitest  
**Build**: TypeScript compiler  

---

## Development Commands

### Installation & Setup
```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm type-check
```

### Before Committing
```bash
# CRITICAL: Run all checks before committing
pnpm build && pnpm type-check && pnpm test:coverage

# Or shortcut:
pnpm pre-commit
```

---

## Contributing Guidelines

### Before Submitting a PR

1. **Check Scope**: Is this feature:
   - Core monitoring logic? ✅ YES
   - Database connector? ✅ YES
   - Alerting logic? ✅ YES
   - CLI tool? ✅ YES
   - Multi-tenant? ❌ NO (don't add)
   - Authentication? ❌ NO (don't add)
   - Dashboard? ❌ NO (don't add)

2. **Run Tests**:
   ```bash
   pnpm test:coverage
   ```
   Coverage must meet thresholds:
   - Lines: ≥50%
   - Functions: ≥40%
   - Branches: ≥50%
   - Statements: ≥50%

3. **Type Check**:
   ```bash
   pnpm type-check
   ```
   No TypeScript errors allowed.

4. **Build**:
   ```bash
   pnpm build
   ```
   Must compile successfully.

5. **Format**:
   - Use ESLint (auto-run on commit if configured)
   - Keep imports clean
   - Use descriptive variable names

6. **Document**:
   - Add JSDoc comments to public functions
   - Update README if adding new connectors
   - Add examples for new features

### Adding a New Database Connector

Example: Adding a new connector (e.g. ClickHouse)

1. Create file: `src/connectors/clickhouse.ts`
2. Extend `BaseConnector` and implement the `Connector` interface
3. **Read connector-specific settings from `config.options`** — never hardcode
   schema, location, warehouse, or similar environment-dependent values:
   ```typescript
   export class ClickHouseConnector extends BaseConnector {
     private schema = 'default'; // sensible default for backward compat

     constructor(config: ConnectorConfig, securityConfig?: Partial<SecurityConfig>) {
       super(config, securityConfig);
       // Read connector-specific options
       if (config.options?.schema && typeof config.options.schema === 'string') {
         this.schema = config.options.schema;
       }
     }
   }
   ```
4. Use `this.schema` (not a hardcoded string) in `listTables()`, `getTableSchema()`,
   and `getLastModified()` queries
5. Add tests: `tests/connectors/clickhouse.test.ts`
6. Export in `src/connectors/index.ts`
7. Document supported `options` keys in the `ConnectorConfig` JSDoc table
   (`src/types/connector.ts`), SKILL.md connector table, and README
8. Add integration test with real/mock database

### Adding a New Monitoring Algorithm

Example: Adding latency detection

1. Create file: `src/monitor/latency.ts`
2. Export function: `export async function checkLatency(config) { }`
3. Add unit tests: `tests/monitor/latency.test.ts`
4. Add to public API: `src/index.ts`
5. Document in README
6. Add example usage

---

## Key Development Rules

### 1. Import Direction (CRITICAL)
```typescript
// ✅ OK: Internal imports from types
import { type MonitoringRule } from './types.js';

// ❌ NOT OK: Importing from cloud or external packages
import { something } from 'freshguard-cloud';  // NEVER
```

### 2. No Browser APIs
```typescript
// ❌ NO
import { localStorage } from 'browser';  // This is CLI/Node, not browser

// ✅ YES
import { readFile } from 'fs';
import { env } from 'process';
```

### 3. No Proprietary Dependencies
Only use OSI-approved open-source licenses:
- MIT
- Apache 2.0
- BSD
- GPL (if compatible)

```bash
# Check before adding
pnpm view PACKAGE_NAME license
```

### 4. Backwards Compatibility
Once published to npm, breaking changes need major version bump.
```typescript
// ❌ Breaking change in 0.2.0
export function checkFreshness(config: NewInterface) { }  // Signature changed

// ✅ Non-breaking in 0.2.0
export function checkFreshness(config: Config) { }
export function checkFreshnessV2(config: NewInterface) { }  // Additive
```

---

## Testing Strategy

### Running Tests
```bash
# Run all tests
pnpm test

# Run with coverage (required for commits)
pnpm test:coverage

# Run specific test file
pnpm test -- freshness.test.ts

# Watch mode (development)
pnpm test -- --watch
```

**Test Requirements**:
- Unit tests for algorithms (freshness, volume)
- Integration tests for connectors (use real databases in CI)
- Error handling tests
- Config validation tests


---

## Publishing to npm

### Before Publishing
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite: `pnpm test:coverage`
4. Tag release: `git tag v0.1.0`
5. Push tag: `git push origin v0.1.0`

### Automatic Publishing
GitHub Actions automatically publishes when you:
1. Push a tag matching `v*.*.*`
2. GitHub workflow runs tests
3. If all pass, publishes to npm

See `.github/workflows/publish-npm.yml` for details.

### Manual Publishing (if needed)
```bash
pnpm publish
```

---

## Documentation

### For Users (Self-Hosters)
See `docs/SELF_HOSTING.md`:
- Installation instructions
- Configuration examples
- Docker usage
- Troubleshooting

### For Developers
See `docs/CONTRIBUTING.md`:
- Development setup
- Code standards
- Testing guide
- PR process

### For Licensing Questions
See `docs/LICENSE_CLARIFICATION.md`:
- What's open vs. proprietary
- Can I fork the cloud version? NO
- Can I deploy core? YES
- License compatibility

---

## Common Tasks

### Add a New Database Type to Schema
1. Update `src/db/schema.ts`
2. Create migration: `src/db/migrations/00X_description.sql`
3. Update docs
4. Add tests
5. Run `pnpm build && pnpm test`

### Create a New Alert Type
1. Add interface to `src/types.ts`
2. Implement logic in `src/monitor/`
3. Export in `src/index.ts`
4. Add tests
5. Document usage

### Fix a Bug
1. Create test that reproduces bug
2. Fix the bug in source code
3. Verify test passes
4. Run `pnpm pre-commit`
5. Submit PR

---

## Troubleshooting

### "Module not found" errors
```bash
# Make sure dependencies are installed
pnpm install

# Then build
pnpm build
```

### "Test coverage threshold not met"
```bash
# Check what's missing
pnpm test:coverage

# Add tests to increase coverage
# Then retry:
pnpm test:coverage
```

### "Build fails with TypeScript errors"
```bash
# Check types
pnpm type-check

# Fix errors, then try again
pnpm build
```

---

## Getting Help

- **Issues**: GitHub Issues (check existing first)
- **Discussions**: GitHub Discussions
- **Docs**: See `docs/` folder
- **Licensed Questions**: See `docs/LICENSE_CLARIFICATION.md`

---

## Important Reminders

1. **This is MIT licensed** - Anyone can use it, modify it, sell it
2. **Self-hosters can use this** - No vendor lock-in
3. **Contributors welcome** - PRs are reviewed fairly
4. **No proprietary code** - All code must be open source compatible
5. **Breaking changes need major version** - Semantic versioning
6. **Test coverage is required** - No code without tests
7. **Documentation matters** - Users need to understand how to use this

---

## Philosophy

FreshGuard Core exists for:
✅ Self-hosted data pipeline monitoring  
✅ Community contributions  
✅ Extensibility (custom connectors, algorithms)  
✅ Freedom from vendor lock-in  

FreshGuard Core does NOT handle:
❌ Multi-tenant SaaS complexity  
❌ User authentication  
❌ Billing  
❌ Team management  

That's what the Cloud package (private repo) handles. Keep Core simple, focused, and open.
