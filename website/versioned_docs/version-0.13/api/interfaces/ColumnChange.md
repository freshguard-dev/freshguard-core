# Interface: ColumnChange

Defined in: [src/types.ts:210](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L210)

Column change detected in schema monitoring

## Properties

### changeType

> **changeType**: `"added"` \| `"removed"` \| `"type_changed"` \| `"nullability_changed"`

Defined in: [src/types.ts:212](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L212)

***

### columnName

> **columnName**: `string`

Defined in: [src/types.ts:211](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L211)

***

### impact

> **impact**: `"safe"` \| `"warning"` \| `"breaking"`

Defined in: [src/types.ts:215](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L215)

***

### newValue?

> `optional` **newValue**: `string`

Defined in: [src/types.ts:214](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L214)

***

### oldValue?

> `optional` **oldValue**: `string`

Defined in: [src/types.ts:213](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/types.ts#L213)
