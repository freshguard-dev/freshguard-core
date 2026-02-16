# Class: PostgreSQLMetadataStorage

Defined in: [src/metadata/postgresql-storage.ts:30](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L30)

## Implements

- [`MetadataStorage`](../interfaces/MetadataStorage.md)

## Constructors

### Constructor

> **new PostgreSQLMetadataStorage**(`connectionUrl`, `metadataConfig?`): `PostgreSQLMetadataStorage`

Defined in: [src/metadata/postgresql-storage.ts:36](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L36)

#### Parameters

##### connectionUrl

`string`

##### metadataConfig?

[`MetadataStorageConfig`](../interfaces/MetadataStorageConfig.md)

#### Returns

`PostgreSQLMetadataStorage`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/metadata/postgresql-storage.ts:294](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L294)

Close storage connections

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`close`](../interfaces/MetadataStorage.md#close)

***

### getHistoricalData()

> **getHistoricalData**(`ruleId`, `days`): `Promise`\<`MetadataExecution`[]\>

Defined in: [src/metadata/postgresql-storage.ts:87](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L87)

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

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`getHistoricalData`](../interfaces/MetadataStorage.md#gethistoricaldata)

***

### getRule()

> **getRule**(`ruleId`): `Promise`\<[`MonitoringRule`](../interfaces/MonitoringRule.md) \| `null`\>

Defined in: [src/metadata/postgresql-storage.ts:169](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L169)

Get monitoring rule by ID

#### Parameters

##### ruleId

`string`

#### Returns

`Promise`\<[`MonitoringRule`](../interfaces/MonitoringRule.md) \| `null`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`getRule`](../interfaces/MetadataStorage.md#getrule)

***

### getSchemaBaseline()

> **getSchemaBaseline**(`ruleId`): `Promise`\<[`SchemaBaseline`](../interfaces/SchemaBaseline.md) \| `null`\>

Defined in: [src/metadata/postgresql-storage.ts:253](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L253)

Get schema baseline for a rule

#### Parameters

##### ruleId

`string`

#### Returns

`Promise`\<[`SchemaBaseline`](../interfaces/SchemaBaseline.md) \| `null`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`getSchemaBaseline`](../interfaces/MetadataStorage.md#getschemabaseline)

***

### initialize()

> **initialize**(): `Promise`\<`void`\>

Defined in: [src/metadata/postgresql-storage.ts:48](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L48)

Initialize storage (create tables, etc.)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`initialize`](../interfaces/MetadataStorage.md#initialize)

***

### saveExecution()

> **saveExecution**(`execution`): `Promise`\<`void`\>

Defined in: [src/metadata/postgresql-storage.ts:63](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L63)

Save execution result for historical analysis

#### Parameters

##### execution

`MetadataExecution`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`saveExecution`](../interfaces/MetadataStorage.md#saveexecution)

***

### saveRule()

> **saveRule**(`rule`): `Promise`\<`void`\>

Defined in: [src/metadata/postgresql-storage.ts:136](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L136)

Save monitoring rule configuration

#### Parameters

##### rule

[`MonitoringRule`](../interfaces/MonitoringRule.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`saveRule`](../interfaces/MetadataStorage.md#saverule)

***

### storeSchemaBaseline()

> **storeSchemaBaseline**(`baseline`, `adaptationReason?`): `Promise`\<`void`\>

Defined in: [src/metadata/postgresql-storage.ts:213](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/metadata/postgresql-storage.ts#L213)

Store schema baseline for comparison

#### Parameters

##### baseline

[`SchemaBaseline`](../interfaces/SchemaBaseline.md)

##### adaptationReason?

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`storeSchemaBaseline`](../interfaces/MetadataStorage.md#storeschemabaseline)
