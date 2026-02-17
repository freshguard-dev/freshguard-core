# Interface: MonitoringRule

Defined in: [src/types.ts:90](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L90)

Monitoring rule configuration

Pass a `MonitoringRule` to `checkFreshness`, `checkVolumeAnomaly`, or
`checkSchemaChanges` to define what to monitor and the alert thresholds.

## Example

```typescript
const rule: MonitoringRule = {
  id: 'orders-freshness',
  sourceId: 'prod_pg',
  name: 'Orders Freshness',
  tableName: 'orders',
  ruleType: 'freshness',
  toleranceMinutes: 60,
  timestampColumn: 'updated_at',
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Properties

### baselineConfig?

> `optional` **baselineConfig**: `object`

Defined in: [src/types.ts:109](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L109)

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

Defined in: [src/types.ts:104](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L104)

***

### checkIntervalMinutes

> **checkIntervalMinutes**: `number`

Defined in: [src/types.ts:145](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L145)

***

### consecutiveFailures?

> `optional` **consecutiveFailures**: `number`

Defined in: [src/types.ts:152](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L152)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/types.ts:154](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L154)

***

### customSql?

> `optional` **customSql**: `string`

Defined in: [src/types.ts:141](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L141)

***

### description?

> `optional` **description**: `string`

Defined in: [src/types.ts:94](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L94)

***

### deviationThresholdPercent?

> `optional` **deviationThresholdPercent**: `number`

Defined in: [src/types.ts:105](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L105)

***

### expectedFrequency?

> `optional` **expectedFrequency**: `string`

Defined in: [src/types.ts:99](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L99)

***

### expectedResult?

> `optional` **expectedResult**: `unknown`

Defined in: [src/types.ts:142](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L142)

***

### id

> **id**: `string`

Defined in: [src/types.ts:91](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L91)

***

### isActive

> **isActive**: `boolean`

Defined in: [src/types.ts:149](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L149)

***

### lastCheckAt?

> `optional` **lastCheckAt**: `Date`

Defined in: [src/types.ts:150](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L150)

***

### lastStatus?

> `optional` **lastStatus**: [`CheckStatus`](../type-aliases/CheckStatus.md)

Defined in: [src/types.ts:151](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L151)

***

### maxRowThreshold?

> `optional` **maxRowThreshold**: `number`

Defined in: [src/types.ts:121](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L121)

***

### minimumRowCount?

> `optional` **minimumRowCount**: `number`

Defined in: [src/types.ts:106](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L106)

***

### minRowThreshold?

> `optional` **minRowThreshold**: `number`

Defined in: [src/types.ts:120](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L120)

***

### name

> **name**: `string`

Defined in: [src/types.ts:93](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L93)

***

### ruleType

> **ruleType**: [`RuleType`](../type-aliases/RuleType.md)

Defined in: [src/types.ts:96](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L96)

***

### schemaChangeConfig?

> `optional` **schemaChangeConfig**: `object`

Defined in: [src/types.ts:128](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L128)

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

Defined in: [src/types.ts:92](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L92)

***

### tableName

> **tableName**: `string`

Defined in: [src/types.ts:95](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L95)

***

### timestampColumn?

> `optional` **timestampColumn**: `string`

Defined in: [src/types.ts:101](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L101)

***

### timezone?

> `optional` **timezone**: `string`

Defined in: [src/types.ts:146](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L146)

***

### toleranceMinutes?

> `optional` **toleranceMinutes**: `number`

Defined in: [src/types.ts:100](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L100)

***

### trackColumnChanges?

> `optional` **trackColumnChanges**: `boolean`

Defined in: [src/types.ts:124](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L124)

***

### trackTableChanges?

> `optional` **trackTableChanges**: `boolean`

Defined in: [src/types.ts:125](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L125)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [src/types.ts:155](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L155)
