# Function: checkVolumeThreshold()

> **checkVolumeThreshold**(`connector`, `rule`, `config?`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

Defined in: [src/monitor/volume-threshold.ts:53](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/monitor/volume-threshold.ts#L53)

Check whether a table's row count is within the configured min/max thresholds.

Returns `'alert'` when the row count is below `minRowThreshold` or above
`maxRowThreshold`. At least one threshold must be set on the rule.

## Parameters

### connector

`Connector`

Database connector instance

### rule

[`MonitoringRule`](../interfaces/MonitoringRule.md)

Monitoring rule with `ruleType: 'volume_threshold'` and at least one of `minRowThreshold` / `maxRowThreshold`

### config?

[`FreshGuardConfig`](../interfaces/FreshGuardConfig.md)

Optional configuration including timeouts

## Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

CheckResult with `status`, `rowCount`, and `message`

## Example

```typescript
import { checkVolumeThreshold, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ host: 'localhost', database: 'mydb', username: 'user', password: 'pass', ssl: true });
const rule = {
  id: 'r1', sourceId: 's1', name: 'Orders Volume',
  tableName: 'orders', ruleType: 'volume_threshold' as const,
  minRowThreshold: 100, maxRowThreshold: 10_000_000,
  checkIntervalMinutes: 60, isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
};
const result = await checkVolumeThreshold(connector, rule);
console.log(result.status, result.rowCount);
```

## Since

0.3.0
