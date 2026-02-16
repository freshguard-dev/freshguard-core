# Function: checkVolumeAnomaly()

> **checkVolumeAnomaly**(`connector`, `rule`, `metadataStorage?`, `config?`): `Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

Defined in: [src/monitor/volume.ts:59](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/monitor/volume.ts#L59)

Check for volume anomalies by comparing the current row count against a
historical baseline. Returns `'alert'` when the deviation exceeds the
configured threshold, or `'pending'` while the baseline is being built.

Requires metadata storage to persist and retrieve historical row counts.
At least 3 historical data points are needed before anomaly detection activates.

## Parameters

### connector

`Connector`

Database connector instance

### rule

[`MonitoringRule`](../interfaces/MonitoringRule.md)

Monitoring rule with `ruleType: 'volume_anomaly'`

### metadataStorage?

[`MetadataStorage`](../interfaces/MetadataStorage.md)

Metadata storage for historical baseline data

### config?

[`FreshGuardConfig`](../interfaces/FreshGuardConfig.md)

Optional configuration including debug settings and timeouts

## Returns

`Promise`\<[`CheckResult`](../interfaces/CheckResult.md)\>

CheckResult with `status`, `rowCount`, `deviation`, and optionally `debug` info

## Throws

If the rule is missing required volume fields

## Throws

If the query exceeds the configured timeout

## Example

```typescript
import { checkVolumeAnomaly, createMetadataStorage, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({ host: 'localhost', database: 'mydb', username: 'user', password: 'pass', ssl: true });
const storage = await createMetadataStorage();
const rule = { id: 'r1', sourceId: 's1', name: 'Orders Volume', tableName: 'orders', ruleType: 'volume_anomaly' as const, checkIntervalMinutes: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() };
const result = await checkVolumeAnomaly(connector, rule, storage);
console.log(result.status, result.deviation);
```

## Since

0.1.0
