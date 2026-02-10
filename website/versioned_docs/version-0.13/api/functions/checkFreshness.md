# Function: checkFreshness()

> **checkFreshness**(`connector`, `rule`, `metadataStorage?`, `config?`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

Defined in: [src/monitor/freshness.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/monitor/freshness.ts#L55)

Check data freshness for a given rule with security validation.

Queries `MAX(timestampColumn)` from the target table and compares the lag
against `rule.toleranceMinutes`. Returns `'alert'` if the data is stale.

## Parameters

### connector

`Connector`

Database connector instance

### rule

[`MonitoringRule`](../interfaces/MonitoringRule.md)

Monitoring rule with `ruleType: 'freshness'`, `toleranceMinutes`, and `timestampColumn`

### metadataStorage?

[`MetadataStorage`](../interfaces/MetadataStorage.md)

Optional metadata storage for execution history tracking

### config?

[`FreshGuardConfig`](../interfaces/FreshGuardConfig.md)

Optional configuration including debug settings and timeouts

## Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

CheckResult with `status`, `lagMinutes`, and optionally `debug` info

## Throws

If the rule is missing required freshness fields

## Throws

If the timestamp query fails

## Throws

If the query exceeds the configured timeout

## Example

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ host: 'localhost', database: 'mydb', username: 'user', password: 'pass', ssl: true });
const rule = { id: 'r1', sourceId: 's1', name: 'Orders', tableName: 'orders', ruleType: 'freshness' as const, toleranceMinutes: 60, timestampColumn: 'updated_at', checkIntervalMinutes: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() };
const result = await checkFreshness(connector, rule);
console.log(result.status, result.lagMinutes);
```

## Since

0.1.0
