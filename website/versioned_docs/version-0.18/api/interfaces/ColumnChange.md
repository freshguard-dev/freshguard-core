# Interface: ColumnChange

Defined in: [src/types.ts:261](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L261)

Column change detected in schema monitoring

## Properties

### changeType

> **changeType**: `"added"` \| `"removed"` \| `"type_changed"` \| `"nullability_changed"`

Defined in: [src/types.ts:263](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L263)

***

### columnName

> **columnName**: `string`

Defined in: [src/types.ts:262](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L262)

***

### impact

> **impact**: `"safe"` \| `"warning"` \| `"breaking"`

Defined in: [src/types.ts:266](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L266)

***

### newValue?

> `optional` **newValue**: `string`

Defined in: [src/types.ts:265](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L265)

***

### oldValue?

> `optional` **oldValue**: `string`

Defined in: [src/types.ts:264](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L264)
