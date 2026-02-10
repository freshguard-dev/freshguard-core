# Class: DuckDBMetadataStorage

Defined in: [src/metadata/duckdb-storage.ts:25](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L25)

## Implements

- [`MetadataStorage`](../interfaces/MetadataStorage.md)

## Constructors

### Constructor

> **new DuckDBMetadataStorage**(`dbPath?`): `DuckDBMetadataStorage`

Defined in: [src/metadata/duckdb-storage.ts:29](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L29)

#### Parameters

##### dbPath?

`string` = `'./freshguard-metadata.db'`

#### Returns

`DuckDBMetadataStorage`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/metadata/duckdb-storage.ts:256](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L256)

Close storage connections

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`close`](../interfaces/MetadataStorage.md#close)

***

### getHistoricalData()

> **getHistoricalData**(`ruleId`, `days`): `Promise`\<`MetadataExecution`[]\>

Defined in: [src/metadata/duckdb-storage.ts:126](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L126)

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

Defined in: [src/metadata/duckdb-storage.ts:182](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L182)

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

Defined in: [src/metadata/duckdb-storage.ts:234](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L234)

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

Defined in: [src/metadata/duckdb-storage.ts:31](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L31)

Initialize storage (create tables, etc.)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MetadataStorage`](../interfaces/MetadataStorage.md).[`initialize`](../interfaces/MetadataStorage.md#initialize)

***

### saveExecution()

> **saveExecution**(`execution`): `Promise`\<`void`\>

Defined in: [src/metadata/duckdb-storage.ts:103](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L103)

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

Defined in: [src/metadata/duckdb-storage.ts:160](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L160)

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

Defined in: [src/metadata/duckdb-storage.ts:209](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/metadata/duckdb-storage.ts#L209)

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
