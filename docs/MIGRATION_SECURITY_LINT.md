# Migration Guide: Security Lint Remediation

This document covers the breaking changes introduced by the security lint
remediation effort. All 933 lint problems (667 errors, 266 warnings) were
resolved to reach zero lint issues across the codebase.

## Summary of Changes

| Category | Impact | Details |
|----------|--------|---------|
| `any` replaced with `unknown`/`Record<string, unknown>` | **Breaking** for subclasses | Protected method signatures changed |
| `QueryResultRow` type added | Additive | New type `Record<string, unknown>` for DB results |
| `rowString()` helper added | Additive | Safe unknown-to-string conversion |
| ESLint security plugins added | Dev-only | `eslint-plugin-security`, `eslint-plugin-no-secrets` |
| CI lint enforcement | Dev-only | `pnpm lint:check` added to GitHub Actions |

## Breaking Changes

### 1. Protected Method Signatures in `BaseConnector`

If you extend `BaseConnector` with a custom connector, the following
protected method signatures have changed:

**Before:**
```typescript
protected abstract executeQuery(sql: string): Promise<any[]>;
protected async executeParameterizedQuery(sql: string, parameters: any[]): Promise<any[]>;
protected validateResultSize(results: any[]): void;
```

**After:**
```typescript
protected abstract executeQuery(sql: string): Promise<QueryResultRow[]>;
protected async executeParameterizedQuery(sql: string, parameters: unknown[]): Promise<QueryResultRow[]>;
protected validateResultSize(results: QueryResultRow[]): void;
```

**How to migrate:**
```typescript
import type { QueryResultRow } from '@freshguard/freshguard-core/types/driver-results';

// Update your connector's executeQuery implementation:
protected async executeQuery(sql: string): Promise<QueryResultRow[]> {
  const rows = await this.driver.query(sql);
  return rows as QueryResultRow[];
}

// Update executeParameterizedQuery if overridden:
protected async executeParameterizedQuery(
  sql: string,
  parameters: unknown[] = []
): Promise<QueryResultRow[]> {
  const rows = await this.driver.query(sql, parameters);
  return rows as QueryResultRow[];
}
```

### 2. `QueryResultRow` Type for Database Results

All connector methods now return `QueryResultRow` (`Record<string, unknown>`)
instead of `any[]`. This means accessing row properties requires type
narrowing:

**Before:**
```typescript
const result = await connector.getRowCount('orders');
// result was typed as any, no complaints
```

**After:**
```typescript
// Public methods like getRowCount() and getMaxTimestamp() are unchanged
// in their return types (number, Date|null, etc.)
// Only internal/protected methods changed.
```

> **Note:** The public API (`getRowCount()`, `getMaxTimestamp()`,
> `listTables()`, `getTableSchema()`, `testConnection()`) return types
> are **unchanged**. Only protected/internal methods are affected.

### 3. `rowString()` Helper for Safe String Conversion

When working with `QueryResultRow` values (which are `unknown`), use
`rowString()` instead of `String()`:

**Before:**
```typescript
const name = String(row.column_name ?? '');
```

**After:**
```typescript
import { rowString } from '@freshguard/freshguard-core/types/driver-results';
const name = rowString(row.column_name);
```

`rowString()` handles `string`, `null`, `undefined`, `number`, `boolean`,
`bigint`, `Date`, and objects (via `JSON.stringify`) without triggering
`no-base-to-string` lint errors.

### 4. Validation Return Types

`validateConnectorConfig()` from `runtime-validator.ts` now returns
`ValidationResult<Record<string, unknown>>` instead of
`ValidationResult<any>`.

**Before:**
```typescript
const result = validator.validateConnectorConfig(config, 'postgres');
// result.data was any
```

**After:**
```typescript
const result = validator.validateConnectorConfig(config, 'postgres');
// result.data is Record<string, unknown>
// Access properties with type narrowing:
if (result.success) {
  const host = result.data.host as string;
}
```

## Non-Breaking Changes

These changes improve code quality but do not affect the public API:

- **Regex escapes fixed**: Unnecessary escapes in character classes removed
  (e.g., `\-` to `-`, `\.` to `.` inside `[...]`)
- **Nullish coalescing**: `||` replaced with `??` where appropriate for
  safer default values
- **Non-null assertions removed**: Replaced `obj!.method()` with explicit
  null checks across all connectors
- **`eslint-disable` comments**: Added inline disable comments for
  intentional patterns (deprecated stubs, validated non-literal arguments)
- **Control character regex**: Added `no-control-regex` disable comments
  where control character detection is intentional (sanitizers, validators)

## New Dependencies (Dev Only)

```json
{
  "devDependencies": {
    "eslint-plugin-security": "^3.0.1",
    "eslint-plugin-no-secrets": "^1.1.2"
  }
}
```

These are development-only dependencies and do not affect the runtime bundle.

## CI Changes

The GitHub Actions workflow (`core-test.yml`) now includes a `pnpm lint:check`
step that runs before type-checking. This enforces zero lint errors on all
PRs.

## Checklist for Integrating Projects

- [ ] If you extend `BaseConnector`: update protected method signatures to use
      `QueryResultRow[]` and `unknown[]`
- [ ] If you use `validateConnectorConfig()` directly: update to handle
      `Record<string, unknown>` return type
- [ ] If you cast database results from `any`: switch to `QueryResultRow` and
      use `rowString()` for string conversion
- [ ] Run `pnpm type-check` to verify no type errors from the changes
- [ ] Run `pnpm lint:check` to verify zero lint issues
