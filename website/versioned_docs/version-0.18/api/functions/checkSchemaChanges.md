# Function: checkSchemaChanges()

> **checkSchemaChanges**(`connector`, `rule`, `metadataStorage?`, `config?`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

Defined in: [src/monitor/schema-changes.ts:61](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/monitor/schema-changes.ts#L61)

Detect schema changes by comparing the current table schema against a stored
baseline. Returns `'alert'` when columns are added, removed, or modified.

On the first run (no baseline), stores the current schema and returns `'ok'`.
Subsequent runs compare against that baseline. The `adaptationMode` in
`rule.schemaChangeConfig` controls whether safe changes auto-update the baseline.

Requires metadata storage to persist schema baselines.

## Parameters

### connector

`Connector`

Database connector instance

### rule

[`MonitoringRule`](../interfaces/MonitoringRule.md)

Monitoring rule with `ruleType: 'schema_change'` and optional `schemaChangeConfig`

### metadataStorage?

[`MetadataStorage`](../interfaces/MetadataStorage.md)

Metadata storage for schema baseline persistence

### config?

[`FreshGuardConfig`](../interfaces/FreshGuardConfig.md)

Optional configuration including debug settings and timeouts

## Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

CheckResult with `status` and `schemaChanges` containing added/removed/modified columns

## Throws

If the rule is missing required schema change fields

## Throws

If the schema query fails

## Throws

If the query exceeds the configured timeout

## Example

```typescript
import { checkSchemaChanges, createMetadataStorage, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ host: 'localhost', database: 'mydb', username: 'user', password: 'pass', ssl: true });
const storage = await createMetadataStorage();
const rule = { id: 'r1', sourceId: 's1', name: 'Users Schema', tableName: 'users', ruleType: 'schema_change' as const, checkIntervalMinutes: 60, isActive: true, schemaChangeConfig: { adaptationMode: 'manual' as const, monitoringMode: 'full' as const }, createdAt: new Date(), updatedAt: new Date() };
const result = await checkSchemaChanges(connector, rule, storage);
if (result.schemaChanges?.hasChanges) { console.log(result.schemaChanges.summary); }
```

## Since

0.10.0
