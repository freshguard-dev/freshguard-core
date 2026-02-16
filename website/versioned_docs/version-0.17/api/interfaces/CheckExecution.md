# Interface: CheckExecution

Defined in: [src/types.ts:232](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L232)

Check execution record (stored in database)

## Properties

### baselineAverage?

> `optional` **baselineAverage**: `number`

Defined in: [src/types.ts:243](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L243)

***

### currentDeviationPercent?

> `optional` **currentDeviationPercent**: `number`

Defined in: [src/types.ts:244](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L244)

***

### errorMessage?

> `optional` **errorMessage**: `string`

Defined in: [src/types.ts:237](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L237)

***

### executedAt

> **executedAt**: `Date`

Defined in: [src/types.ts:246](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L246)

***

### executionDurationMs?

> `optional` **executionDurationMs**: `number`

Defined in: [src/types.ts:239](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L239)

***

### id

> **id**: `string`

Defined in: [src/types.ts:233](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L233)

***

### lagMinutes?

> `optional` **lagMinutes**: `number`

Defined in: [src/types.ts:242](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L242)

***

### lastUpdate?

> `optional` **lastUpdate**: `Date`

Defined in: [src/types.ts:241](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L241)

***

### nextCheckAt?

> `optional` **nextCheckAt**: `Date`

Defined in: [src/types.ts:247](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L247)

***

### queryExecuted?

> `optional` **queryExecuted**: `string`

Defined in: [src/types.ts:238](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L238)

***

### rowCount?

> `optional` **rowCount**: `number`

Defined in: [src/types.ts:240](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L240)

***

### ruleId

> **ruleId**: `string`

Defined in: [src/types.ts:234](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L234)

***

### schemaChanges?

> `optional` **schemaChanges**: `unknown`

Defined in: [src/types.ts:245](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L245)

***

### sourceId

> **sourceId**: `string`

Defined in: [src/types.ts:235](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L235)

***

### status

> **status**: [`CheckStatus`](../type-aliases/CheckStatus.md)

Defined in: [src/types.ts:236](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L236)
