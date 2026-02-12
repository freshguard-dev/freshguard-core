# Interface: FreshGuardConfig

Defined in: [src/types.ts:395](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L395)

Self-hosting configuration file

## Properties

### debug?

> `optional` **debug**: `DebugConfig`

Defined in: [src/types.ts:420](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L420)

***

### rules

> **rules**: `object`[]

Defined in: [src/types.ts:401](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L401)

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

Defined in: [src/types.ts:413](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L413)

#### enabled

> **enabled**: `boolean`

#### timezone?

> `optional` **timezone**: `string`

***

### sources

> **sources**: `Record`\<`string`, \{ `credentials?`: [`SourceCredentials`](SourceCredentials.md); `type`: [`DataSourceType`](../type-aliases/DataSourceType.md); `url?`: `string`; \}\>

Defined in: [src/types.ts:396](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L396)

***

### timeoutMs?

> `optional` **timeoutMs**: `number`

Defined in: [src/types.ts:419](https://github.com/freshguard-dev/freshguard-core/blob/e898fa5f7d8c24d99eff84bdc9fc6ed269d0e0a4/src/types.ts#L419)
