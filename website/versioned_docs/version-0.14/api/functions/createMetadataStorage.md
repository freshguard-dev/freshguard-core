# Function: createMetadataStorage()

> **createMetadataStorage**(`config?`): `Promise`\<[`MetadataStorage`](../interfaces/MetadataStorage.md)\>

Defined in: [src/metadata/factory.ts:37](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/metadata/factory.ts#L37)

Create and initialize a metadata storage instance.

Defaults to embedded DuckDB when called without arguments (zero-setup).
Pass a config object to use PostgreSQL or customize the DuckDB path.

## Parameters

### config?

[`MetadataStorageConfig`](../interfaces/MetadataStorageConfig.md)

Optional storage configuration. Omit for default DuckDB storage.

## Returns

`Promise`\<[`MetadataStorage`](../interfaces/MetadataStorage.md)\>

Initialized MetadataStorage ready for use

## Throws

If `type` is `'postgresql'` and `url` is not provided

## Example

```typescript
// Zero-setup DuckDB (default)
const storage = await createMetadataStorage();

// Custom DuckDB path
const storage = await createMetadataStorage({ type: 'duckdb', path: './data/meta.db' });

// PostgreSQL
const storage = await createMetadataStorage({
  type: 'postgresql',
  url: 'postgresql://user:pass@host:5432/freshguard_metadata',
});
```

## Since

0.6.0
