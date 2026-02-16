# Interface: CheckResult

Defined in: [src/types.ts:210](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L210)

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

Defined in: [src/types.ts:216](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L216)

***

### debug?

> `optional` **debug**: `DebugInfo`

Defined in: [src/types.ts:226](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L226)

***

### debugId?

> `optional` **debugId**: `string`

Defined in: [src/types.ts:225](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L225)

***

### deviation?

> `optional` **deviation**: `number`

Defined in: [src/types.ts:215](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L215)

***

### error?

> `optional` **error**: `string`

Defined in: [src/types.ts:218](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L218)

***

### executedAt

> **executedAt**: `Date`

Defined in: [src/types.ts:221](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L221)

***

### executionDurationMs?

> `optional` **executionDurationMs**: `number`

Defined in: [src/types.ts:220](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L220)

***

### lagMinutes?

> `optional` **lagMinutes**: `number`

Defined in: [src/types.ts:214](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L214)

***

### lastUpdate?

> `optional` **lastUpdate**: `Date`

Defined in: [src/types.ts:213](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L213)

***

### nextCheckAt?

> `optional` **nextCheckAt**: `Date`

Defined in: [src/types.ts:222](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L222)

***

### queryExecuted?

> `optional` **queryExecuted**: `string`

Defined in: [src/types.ts:219](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L219)

***

### rowCount?

> `optional` **rowCount**: `number`

Defined in: [src/types.ts:212](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L212)

***

### schemaChanges?

> `optional` **schemaChanges**: [`SchemaChanges`](SchemaChanges.md)

Defined in: [src/types.ts:217](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L217)

***

### status

> **status**: [`CheckStatus`](../type-aliases/CheckStatus.md)

Defined in: [src/types.ts:211](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L211)
