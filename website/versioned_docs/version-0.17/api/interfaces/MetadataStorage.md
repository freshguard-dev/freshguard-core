# Interface: MetadataStorage

Defined in: [src/metadata/interface.ts:24](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L24)

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/metadata/interface.ts:66](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L66)

Close storage connections

#### Returns

`Promise`\<`void`\>

***

### getHistoricalData()

> **getHistoricalData**(`ruleId`, `days`): `Promise`\<`MetadataExecution`[]\>

Defined in: [src/metadata/interface.ts:36](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L36)

Get historical execution data for anomaly detection baseline

#### Parameters

##### ruleId

`string`

The monitoring rule ID

##### days

`number`

Number of days to look back

#### Returns

`Promise`\<`MetadataExecution`[]\>

Array of execution records

***

### getRule()

> **getRule**(`ruleId`): `Promise`\<[`MonitoringRule`](MonitoringRule.md) \| `null`\>

Defined in: [src/metadata/interface.ts:46](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L46)

Get monitoring rule by ID

#### Parameters

##### ruleId

`string`

#### Returns

`Promise`\<[`MonitoringRule`](MonitoringRule.md) \| `null`\>

***

### getSchemaBaseline()

> **getSchemaBaseline**(`ruleId`): `Promise`\<[`SchemaBaseline`](SchemaBaseline.md) \| `null`\>

Defined in: [src/metadata/interface.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L56)

Get schema baseline for a rule

#### Parameters

##### ruleId

`string`

#### Returns

`Promise`\<[`SchemaBaseline`](SchemaBaseline.md) \| `null`\>

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/metadata/interface.ts:61](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L61)

Initialize storage (create tables, etc.)

#### Returns

`Promise`\<`void`\>

***

### saveExecution()

> **saveExecution**(`execution`): `Promise`\<`void`\>

Defined in: [src/metadata/interface.ts:28](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L28)

Save execution result for historical analysis

#### Parameters

##### execution

`MetadataExecution`

#### Returns

`Promise`\<`void`\>

***

### saveRule()

> **saveRule**(`rule`): `Promise`\<`void`\>

Defined in: [src/metadata/interface.ts:41](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L41)

Save monitoring rule configuration

#### Parameters

##### rule

[`MonitoringRule`](MonitoringRule.md)

#### Returns

`Promise`\<`void`\>

***

### storeSchemaBaseline()

> **storeSchemaBaseline**(`baseline`, `adaptationReason?`): `Promise`\<`void`\>

Defined in: [src/metadata/interface.ts:51](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/interface.ts#L51)

Store schema baseline for comparison

#### Parameters

##### baseline

[`SchemaBaseline`](SchemaBaseline.md)

##### adaptationReason?

`string`

#### Returns

`Promise`\<`void`\>
