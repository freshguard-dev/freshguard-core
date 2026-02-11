# Interface: MonitoringRule

Defined in: [src/types.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L55)

Monitoring rule configuration

## Properties

### baselineConfig?

> `optional` **baselineConfig**: `object`

Defined in: [src/types.ts:74](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L74)

#### calculationMethod?

> `optional` **calculationMethod**: `"mean"` \| `"median"` \| `"trimmed_mean"`

#### excludeWeekends?

> `optional` **excludeWeekends**: `boolean`

#### minimumDataPoints?

> `optional` **minimumDataPoints**: `number`

#### seasonalAdjustment?

> `optional` **seasonalAdjustment**: `boolean`

#### timeoutSeconds?

> `optional` **timeoutSeconds**: `number`

#### trimmedMeanPercentile?

> `optional` **trimmedMeanPercentile**: `number`

#### windowDays?

> `optional` **windowDays**: `number`

***

### baselineWindowDays?

> `optional` **baselineWindowDays**: `number`

Defined in: [src/types.ts:69](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L69)

***

### checkIntervalMinutes

> **checkIntervalMinutes**: `number`

Defined in: [src/types.ts:106](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L106)

***

### consecutiveFailures?

> `optional` **consecutiveFailures**: `number`

Defined in: [src/types.ts:113](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L113)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/types.ts:115](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L115)

***

### customSql?

> `optional` **customSql**: `string`

Defined in: [src/types.ts:102](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L102)

***

### description?

> `optional` **description**: `string`

Defined in: [src/types.ts:59](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L59)

***

### deviationThresholdPercent?

> `optional` **deviationThresholdPercent**: `number`

Defined in: [src/types.ts:70](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L70)

***

### expectedFrequency?

> `optional` **expectedFrequency**: `string`

Defined in: [src/types.ts:64](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L64)

***

### expectedResult?

> `optional` **expectedResult**: `unknown`

Defined in: [src/types.ts:103](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L103)

***

### id

> **id**: `string`

Defined in: [src/types.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L56)

***

### isActive

> **isActive**: `boolean`

Defined in: [src/types.ts:110](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L110)

***

### lastCheckAt?

> `optional` **lastCheckAt**: `Date`

Defined in: [src/types.ts:111](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L111)

***

### lastStatus?

> `optional` **lastStatus**: [`CheckStatus`](../type-aliases/CheckStatus.md)

Defined in: [src/types.ts:112](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L112)

***

### minimumRowCount?

> `optional` **minimumRowCount**: `number`

Defined in: [src/types.ts:71](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L71)

***

### name

> **name**: `string`

Defined in: [src/types.ts:58](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L58)

***

### ruleType

> **ruleType**: [`RuleType`](../type-aliases/RuleType.md)

Defined in: [src/types.ts:61](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L61)

***

### schemaChangeConfig?

> `optional` **schemaChangeConfig**: `object`

Defined in: [src/types.ts:89](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L89)

#### adaptationMode?

> `optional` **adaptationMode**: `"auto"` \| `"manual"` \| `"alert_only"`

#### baselineRefreshDays?

> `optional` **baselineRefreshDays**: `number`

#### monitoringMode?

> `optional` **monitoringMode**: `"full"` \| `"partial"`

#### trackedColumns?

> `optional` **trackedColumns**: `object`

##### trackedColumns.alertLevel?

> `optional` **alertLevel**: `"low"` \| `"medium"` \| `"high"`

##### trackedColumns.columns?

> `optional` **columns**: `string`[]

##### trackedColumns.trackNullability?

> `optional` **trackNullability**: `boolean`

##### trackedColumns.trackTypes?

> `optional` **trackTypes**: `boolean`

***

### sourceId

> **sourceId**: `string`

Defined in: [src/types.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L57)

***

### tableName

> **tableName**: `string`

Defined in: [src/types.ts:60](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L60)

***

### timestampColumn?

> `optional` **timestampColumn**: `string`

Defined in: [src/types.ts:66](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L66)

***

### timezone?

> `optional` **timezone**: `string`

Defined in: [src/types.ts:107](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L107)

***

### toleranceMinutes?

> `optional` **toleranceMinutes**: `number`

Defined in: [src/types.ts:65](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L65)

***

### trackColumnChanges?

> `optional` **trackColumnChanges**: `boolean`

Defined in: [src/types.ts:85](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L85)

***

### trackTableChanges?

> `optional` **trackTableChanges**: `boolean`

Defined in: [src/types.ts:86](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L86)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [src/types.ts:116](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L116)
