---
sidebar_position: 3
---

# Adding a Monitoring Algorithm

How to add a new type of data quality check.

## 1. Create the algorithm file

Create `src/monitor/mycheck.ts`:

```typescript
import type { Connector } from '../types/connector.js';
import type { MonitoringRule, CheckResult, FreshGuardConfig } from '../types.js';
import type { MetadataStorage } from '../metadata/interface.js';

export async function checkMyThing(
  connector: Connector,
  rule: MonitoringRule,
  metadataStorage?: MetadataStorage,
  config?: FreshGuardConfig,
): Promise<CheckResult> {
  // 1. Validate inputs
  if (rule.ruleType !== 'my_check') {
    return { status: 'failed', error: 'Invalid rule type' };
  }

  // 2. Query data via connector
  const data = await connector.executeQuery(`SELECT ...`);

  // 3. Analyze against rule configuration
  const isAnomaly = /* your detection logic */;

  // 4. Optionally save execution to metadata
  if (metadataStorage) {
    await metadataStorage.saveExecution({ /* ... */ });
  }

  // 5. Return result
  return {
    status: isAnomaly ? 'alert' : 'ok',
    // ... additional fields
  };
}
```

## 2. Export the function

Add to `src/monitor/index.ts`:

```typescript
export { checkMyThing } from './mycheck.js';
```

Add to `src/index.ts`:

```typescript
export { checkMyThing } from './monitor/index.js';
```

## 3. Add types (if needed)

If your check requires new fields on `MonitoringRule` or `CheckResult`, add them to `src/types.ts`. Keep changes backwards-compatible — use optional fields.

## 4. Add tests

Create `tests/monitor/mycheck.test.ts` with:

- Basic detection (happy path)
- No-anomaly case
- Edge cases (empty table, null values)
- Error handling
- Configuration validation

## 5. Document

- Add a guide in `website/docs/guides/`
- Add an example in `website/docs/examples/`
- Add JSDoc with `@param`, `@returns`, `@throws`, `@example`
