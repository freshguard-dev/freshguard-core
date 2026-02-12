# Interface: ColumnChange

Defined in: [src/types.ts:257](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L257)

Column change detected in schema monitoring

## Properties

### changeType

> **changeType**: `"added"` \| `"removed"` \| `"type_changed"` \| `"nullability_changed"`

Defined in: [src/types.ts:259](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L259)

***

### columnName

> **columnName**: `string`

Defined in: [src/types.ts:258](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L258)

***

### impact

> **impact**: `"safe"` \| `"warning"` \| `"breaking"`

Defined in: [src/types.ts:262](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L262)

***

### newValue?

> `optional` **newValue**: `string`

Defined in: [src/types.ts:261](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L261)

***

### oldValue?

> `optional` **oldValue**: `string`

Defined in: [src/types.ts:260](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L260)
