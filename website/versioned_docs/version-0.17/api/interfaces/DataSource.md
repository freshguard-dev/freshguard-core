# Interface: DataSource

Defined in: [src/types.ts:52](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L52)

Data source configuration

Represents a registered database that FreshGuard monitors.

## Example

```typescript
const source: DataSource = {
  id: 'prod_pg',
  name: 'Production PostgreSQL',
  type: 'postgres',
  credentials: { host: 'db.example.com', port: 5432, database: 'app', username: 'reader', password: '***' },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

## Properties

### createdAt

> **createdAt**: `Date`

Defined in: [src/types.ts:63](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L63)

***

### credentials

> **credentials**: [`SourceCredentials`](SourceCredentials.md)

Defined in: [src/types.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L56)

***

### estimatedSizeBytes?

> `optional` **estimatedSizeBytes**: `number`

Defined in: [src/types.ts:62](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L62)

***

### id

> **id**: `string`

Defined in: [src/types.ts:53](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L53)

***

### isActive

> **isActive**: `boolean`

Defined in: [src/types.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L57)

***

### lastError?

> `optional` **lastError**: `string`

Defined in: [src/types.ts:60](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L60)

***

### lastTestedAt?

> `optional` **lastTestedAt**: `Date`

Defined in: [src/types.ts:58](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L58)

***

### lastTestSuccess?

> `optional` **lastTestSuccess**: `boolean`

Defined in: [src/types.ts:59](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L59)

***

### name

> **name**: `string`

Defined in: [src/types.ts:54](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L54)

***

### tableCount?

> `optional` **tableCount**: `number`

Defined in: [src/types.ts:61](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L61)

***

### type

> **type**: [`DataSourceType`](../type-aliases/DataSourceType.md)

Defined in: [src/types.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L55)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [src/types.ts:64](https://github.com/freshguard-dev/freshguard-core/blob/fdaf57c302b8b1704d2c955b8ef6c5929bf128b1/src/types.ts#L64)
