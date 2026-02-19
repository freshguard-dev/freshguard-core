# Interface: CheckResult

Defined in: [src/types.ts:214](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L214)

Check execution result

Returned by `checkFreshness`, `checkVolumeAnomaly`, and `checkSchemaChanges`.
Inspect `status` to decide whether to alert.

## Example

```typescript
const result: CheckResult = await checkFreshness(connector, rule);

if (result.status === 'alert') {
  console.log(`Stale by ${result.lagMinutes} minutes`);
}
```

## Properties

### baselineAverage?

> `optional` **baselineAverage**: `number`

Defined in: [src/types.ts:220](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L220)

***

### debug?

> `optional` **debug**: `DebugInfo`

Defined in: [src/types.ts:230](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L230)

***

### debugId?

> `optional` **debugId**: `string`

Defined in: [src/types.ts:229](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L229)

***

### deviation?

> `optional` **deviation**: `number`

Defined in: [src/types.ts:219](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L219)

***

### error?

> `optional` **error**: `string`

Defined in: [src/types.ts:222](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L222)

***

### executedAt

> **executedAt**: `Date`

Defined in: [src/types.ts:225](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L225)

***

### executionDurationMs?

> `optional` **executionDurationMs**: `number`

Defined in: [src/types.ts:224](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L224)

***

### lagMinutes?

> `optional` **lagMinutes**: `number`

Defined in: [src/types.ts:218](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L218)

***

### lastUpdate?

> `optional` **lastUpdate**: `Date`

Defined in: [src/types.ts:217](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L217)

***

### nextCheckAt?

> `optional` **nextCheckAt**: `Date`

Defined in: [src/types.ts:226](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L226)

***

### queryExecuted?

> `optional` **queryExecuted**: `string`

Defined in: [src/types.ts:223](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L223)

***

### rowCount?

> `optional` **rowCount**: `number`

Defined in: [src/types.ts:216](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L216)

***

### schemaChanges?

> `optional` **schemaChanges**: [`SchemaChanges`](SchemaChanges.md)

Defined in: [src/types.ts:221](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L221)

***

### status

> **status**: [`CheckStatus`](../type-aliases/CheckStatus.md)

Defined in: [src/types.ts:215](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/types.ts#L215)
