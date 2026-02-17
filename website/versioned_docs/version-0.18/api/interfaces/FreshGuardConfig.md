# Interface: FreshGuardConfig

Defined in: [src/types.ts:399](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L399)

Self-hosting configuration file

## Properties

### debug?

> `optional` **debug**: `DebugConfig`

Defined in: [src/types.ts:424](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L424)

***

### rules

> **rules**: `object`[]

Defined in: [src/types.ts:405](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L405)

#### alerts

> **alerts**: `object`[]

#### frequency

> **frequency**: `number`

#### id

> **id**: `string`

#### sourceId

> **sourceId**: `string`

#### table

> **table**: `string`

#### tolerance?

> `optional` **tolerance**: `number`

#### type

> **type**: [`RuleType`](../type-aliases/RuleType.md)

***

### scheduler?

> `optional` **scheduler**: `object`

Defined in: [src/types.ts:417](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L417)

#### enabled

> **enabled**: `boolean`

#### timezone?

> `optional` **timezone**: `string`

***

### sources

> **sources**: `Record`\<`string`, \{ `credentials?`: [`SourceCredentials`](SourceCredentials.md); `type`: [`DataSourceType`](../type-aliases/DataSourceType.md); `url?`: `string`; \}\>

Defined in: [src/types.ts:400](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L400)

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types.ts:423](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/types.ts#L423)
