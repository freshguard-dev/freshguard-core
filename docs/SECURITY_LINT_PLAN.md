# Security Linter Remediation Plan

**Date**: 2026-02-08
**Current state**: 933 lint problems (667 errors, 266 warnings) across 57 files
**Goal**: Zero security-critical lint errors, enforced in CI

---

## Phase 1 — Quick Wins (6 errors, ~10 min)

Low-effort fixes that reduce noise and remove real bugs.

### 1a. Fix `no-useless-escape` in regex patterns (3 errors)

Incorrect regex escaping can cause validation bypasses in a security-sensitive monitoring tool.

| File | Line | Fix |
|------|------|-----|
| `src/connectors/base-connector.ts` | 475 | Remove unnecessary `\.` escape in character class |
| `src/connectors/redshift.ts` | 465 | Remove unnecessary `\.` escape in character class |
| `src/connectors/base-connector.ts` | 170, 193 | Remove unnecessary `\[`, `\]`, `\^` escapes |

### 1b. Replace `||` with `??` in nullish contexts (3 quick errors in mysql.ts)

| File | Lines | Fix |
|------|-------|-----|
| `src/connectors/mysql.ts` | 300-302 | `row.column_name \|\| row.COLUMN_NAME` → `row.column_name ?? row.COLUMN_NAME` |

---

## Phase 2 — Security-Critical Module Type Safety (4 errors, ~1 hour)

The `src/security/` and `src/validation/` directories are the project's own security boundary — they **must** be type-safe.

### 2a. `src/validation/runtime-validator.ts`

This is the only security/validation file with lint errors (4 total).

| Line | Rule | Fix |
|------|------|-----|
| 87 | `no-unsafe-member-access` | Replace `(issue as any).received` with proper Zod type narrowing. Use type guard checking for `ZodInvalidTypeIssue` which carries `.received`. |
| 195 | `no-explicit-any` | Change `ValidationResult<any>` to function overloads returning the correct config type per connector kind. |
| 196 | `no-unsafe-assignment` | Fully parameterize `z.ZodSchema` with a union of possible schema output types. |
| 338 | `no-explicit-any` | Public export `validateConnectorConfig()` returns `any` — use same overload strategy as line 195. |

All other files in `src/security/` and `src/validation/` are already clean.

---

## Phase 3 — Floating Promises (21 errors, ~1 hour)

Unhandled promise rejections can silently skip security checks like SQL validation or schema verification.

### Fix strategy

For each `no-floating-promises` error, apply one of:

1. **`await` the promise** — if it should block execution.
2. **`void promise`** — if it's intentionally fire-and-forget (add comment explaining why).
3. **`.catch(handler)`** — if errors should be logged but not propagated.

Key files affected (from the full lint output):

| File | Approx. count |
|------|----------------|
| `src/connectors/base-connector.ts` | 3 |
| `src/connectors/bigquery.ts` | 2 |
| `src/connectors/snowflake.ts` | 2 |
| `tests/` (various) | ~14 |

---

## Phase 4 — Connector Type Safety (30 errors, ~3 hours)

Every database connector uses `any` because external driver libraries return untyped results. This is the largest category.

### 4a. Create shared result row interfaces

Create `src/types/driver-results.ts`:

```typescript
/** Generic row from any database query */
export interface IQueryRow extends Record<string, unknown> {}

/** Table listing query result */
export interface ITableNameRow {
  table_name?: string;
  TABLE_NAME?: string;   // MySQL/Snowflake uppercase variant
  tablename?: string;    // Redshift variant
}

/** Column metadata query result */
export interface IColumnMetadataRow {
  column_name?: string;
  COLUMN_NAME?: string;
  data_type?: string;
  DATA_TYPE?: string;
  is_nullable?: string;
  IS_NULLABLE?: string;
}
```

### 4b. Make `BaseConnector` generic

```typescript
abstract class BaseConnector<TRow extends IQueryRow = IQueryRow> {
  protected abstract executeQuery(sql: string): Promise<TRow[]>;
  protected abstract executeParameterizedQuery(
    sql: string, parameters: unknown[]
  ): Promise<TRow[]>;
  validateResultSize(results: TRow[]): void;
}
```

### 4c. Type each connector's driver config

Replace `const connectionConfig: any = { ... }` with driver-specific typed configs:

| File | Current | Replacement |
|------|---------|-------------|
| `postgres.ts` | `any` | `postgres.Options<Record<string, postgres.PostgresType>>` |
| `mysql.ts` | `any` | `mysql.ConnectionOptions` |
| `bigquery.ts` | `any` | `BigQueryOptions` from `@google-cloud/bigquery` |
| `snowflake.ts` | `any` | `snowflake.ConnectionOptions` |
| `duckdb.ts` | (none needed) | Already typed |

### 4d. Type result row mappings

Replace `result.map((row: any) => row.table_name)` with:

```typescript
result.map((row: ITableNameRow) => row.table_name ?? row.TABLE_NAME).filter(Boolean)
```

This pattern repeats ~12 times across all connectors.

---

## Phase 5 — Unused Variables & Dead Code (68 errors, ~1 hour)

### 5a. Source files (~20 errors)

Most are caught error variables in `catch` blocks:

```typescript
// Before (error):
} catch (error) {
  // error not used
}

// After (fixed):
} catch (_error) {
  // prefixed with _ to indicate intentionally unused
}
```

### 5b. Test files (~48 errors)

Unused imports and variables in test files. Remove or prefix with `_`.

---

## Phase 6 — Naming Convention (78 errors, ~30 min)

The ESLint config requires interfaces to start with `I` prefix. Two options:

### Option A: Rename all interfaces (invasive)

Add `I` prefix to all 78 interfaces. This is a breaking change for any consumers importing these types.

### Option B: Relax the naming rule (recommended)

The `I` prefix convention is controversial and not standard in modern TypeScript. Relax the rule:

```javascript
// eslint.config.js
'@typescript-eslint/naming-convention': [
  'error',
  {
    selector: 'interface',
    format: ['PascalCase'],
    // Remove prefix: ['I'] requirement
  },
  // ... rest unchanged
]
```

**Recommendation**: Option B. This removes 78 errors instantly without code changes or breaking the public API.

---

## Phase 7 — Remaining Warnings (~154 `prefer-nullish-coalescing` + 44 `explicit-function-return-type` + 46 `require-await`)

### 7a. `prefer-nullish-coalescing` (154 warnings)

Bulk replace `||` with `??` where the left operand can be `""` or `0` (falsy but valid). Can be auto-fixed:

```bash
pnpm lint:fix  # ESLint can auto-fix many of these
```

### 7b. `explicit-function-return-type` (44 warnings)

Add return type annotations to functions in `src/`. Already off for test files.

### 7c. `require-await` (46 warnings)

Either add `await` or remove `async` keyword from functions that don't actually await.

---

## Phase 8 — Add Security-Specific ESLint Plugins

The current config only uses `typescript-eslint`. Add dedicated security scanning:

### 8a. Install `eslint-plugin-security`

```bash
pnpm add -D eslint-plugin-security
```

Catches:
- **Regex DoS** (ReDoS) via `security/detect-unsafe-regex`
- **`child_process` misuse** via `security/detect-child-process`
- **`eval()` usage** via `security/detect-eval`
- **Non-literal `require()`** via `security/detect-non-literal-require`
- **Non-literal `fs` operations** via `security/detect-non-literal-fs-filename`
- **Prototype pollution** via `security/detect-object-injection`

Config addition:

```javascript
// eslint.config.js
import security from 'eslint-plugin-security';

export default tseslint.config(
  // ... existing config ...
  security.configs.recommended,
  {
    rules: {
      // Tune as needed:
      'security/detect-object-injection': 'warn',  // Many false positives
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-child-process': 'error',
      'security/detect-eval-with-expression': 'error',
    }
  }
);
```

### 8b. Install `eslint-plugin-no-secrets`

```bash
pnpm add -D eslint-plugin-no-secrets
```

Prevents accidental secret leakage (API keys, passwords, tokens) in source code.

### 8c. Consider `eslint-plugin-sonarjs`

Catches code quality patterns that often indicate bugs:
- Duplicate branches in if/else
- Identical expressions on both sides of operators
- Collection size misuse
- Cognitive complexity

---

## Phase 9 — Enforce Linting in CI

The current `core-test.yml` does **not** run `lint:check`. Add it:

```yaml
# .github/workflows/core-test.yml — add after "Type check" step
- name: Lint check
  run: pnpm lint:check
```

Also add lint config files to the workflow path triggers:

```yaml
paths:
  - 'src/**'
  - 'tests/**'
  - 'package.json'
  - 'tsconfig.json'
  - 'vitest.config.ts'
  - 'eslint.config.js'        # NEW
  - 'tsconfig.eslint.json'    # NEW
```

---

## Execution Order & Dependencies

```
Phase 1 (Quick Wins)          ─── no dependencies, do first
    │
Phase 6 (Naming Convention)   ─── config-only change, unblocks error count
    │
Phase 2 (Security Modules)    ─── small scope, high value
    │
Phase 3 (Floating Promises)   ─── independent of type work
    │
Phase 4 (Connector Types)     ─── largest phase, can be split per connector
    │
Phase 5 (Unused Variables)    ─── mechanical, can be done in parallel with Phase 4
    │
Phase 7 (Warnings Cleanup)    ─── mostly auto-fixable
    │
Phase 8 (Security Plugins)    ─── install + configure + fix new findings
    │
Phase 9 (CI Enforcement)      ─── LAST — only enable after errors reach zero
```

---

## Expected Error Reduction Per Phase

| Phase | Errors Fixed | Warnings Fixed | Running Total (errors) |
|-------|-------------|----------------|----------------------|
| Start | — | — | 667 errors |
| Phase 1 | 6 | 3 | 661 |
| Phase 6 | 78 | 0 | 583 |
| Phase 2 | 4 | 0 | 579 |
| Phase 3 | 21 | 0 | 558 |
| Phase 4 | ~362 | 0 | ~196 |
| Phase 5 | 68 | 0 | ~128 |
| Phase 7 | ~128 | ~244 | **~0 errors** |
| Phase 8 | (new findings) | (new findings) | TBD |
| Phase 9 | (enforcement) | — | **0 (enforced)** |

---

## Notes

- Phase 4 is the largest effort but has the highest security impact — untyped database results are the primary vector for runtime type confusion.
- Phase 6 (naming convention) is a policy decision. If the team prefers `I`-prefixed interfaces, rename them; otherwise relax the rule. Either way it should be decided up front.
- Phase 8 plugins may surface **new** errors not counted above. Plan for a triage round after installing them.
- Phase 9 should only be enabled when the codebase passes cleanly, otherwise it blocks all PRs.
