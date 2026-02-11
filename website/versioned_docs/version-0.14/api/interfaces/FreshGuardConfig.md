# Interface: FreshGuardConfig

Defined in: [src/types.ts:348](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L348)

Self-hosting configuration file

## Properties

### debug?

> `optional` **debug**: `DebugConfig`

Defined in: [src/types.ts:373](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L373)

***

### rules

> **rules**: `object`[]

Defined in: [src/types.ts:354](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L354)

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

Defined in: [src/types.ts:366](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L366)

#### enabled

> **enabled**: `boolean`

#### timezone?

> `optional` **timezone**: `string`

***

### sources

> **sources**: `Record`\<`string`, \{ `credentials?`: [`SourceCredentials`](SourceCredentials.md); `type`: [`DataSourceType`](../type-aliases/DataSourceType.md); `url?`: `string`; \}\>

Defined in: [src/types.ts:349](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L349)

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types.ts:372](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/types.ts#L372)
