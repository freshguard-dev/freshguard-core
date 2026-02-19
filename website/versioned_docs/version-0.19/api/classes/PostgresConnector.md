# Class: PostgresConnector

Defined in: [src/connectors/postgres.ts:47](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L47)

Secure PostgreSQL connector

Features:
- SQL injection prevention
- Connection timeouts
- SSL enforcement
- Read-only query patterns
- Secure error handling

## Example

```typescript
import { PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: 'localhost', port: 5432,
  database: 'analytics',
  username: 'readonly_user',
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const ok = await connector.testConnection();
const tables = await connector.listTables();
```

## Extends

- `BaseConnector`

## Constructors

### Constructor

> **new PostgresConnector**(`config`, `securityConfig?`): `PostgresConnector`

Defined in: [src/connectors/postgres.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L57)

#### Parameters

##### config

`ConnectorConfig`

Database connection settings (host, port, database, credentials).
  Pass `options.schema` to target a specific schema (default: `'public'`).

##### securityConfig?

`Partial`\<`SecurityConfig`\>

Optional overrides for query timeouts, max rows, SSL, and blocked keywords

#### Returns

`PostgresConnector`

#### Overrides

`BaseConnector.constructor`

## Properties

### config

> `protected` **config**: `ConnectorConfig`

Defined in: [src/connectors/base-connector.ts:63](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L63)

#### Inherited from

`BaseConnector.config`

***

### connectionTimeout

> `protected` `readonly` **connectionTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:49](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L49)

#### Inherited from

`BaseConnector.connectionTimeout`

***

### enableDetailedLogging

> `protected` `readonly` **enableDetailedLogging**: `boolean`

Defined in: [src/connectors/base-connector.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L57)

#### Inherited from

`BaseConnector.enableDetailedLogging`

***

### enableQueryAnalysis

> `protected` `readonly` **enableQueryAnalysis**: `boolean`

Defined in: [src/connectors/base-connector.ts:58](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L58)

#### Inherited from

`BaseConnector.enableQueryAnalysis`

***

### logger

> `protected` `readonly` **logger**: `StructuredLogger`

Defined in: [src/connectors/base-connector.ts:53](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L53)

#### Inherited from

`BaseConnector.logger`

***

### maxRows

> `protected` `readonly` **maxRows**: `number`

Defined in: [src/connectors/base-connector.ts:51](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L51)

#### Inherited from

`BaseConnector.maxRows`

***

### metrics

> `protected` `readonly` **metrics**: `MetricsCollector`

Defined in: [src/connectors/base-connector.ts:54](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L54)

#### Inherited from

`BaseConnector.metrics`

***

### queryAnalyzer

> `protected` `readonly` **queryAnalyzer**: `QueryComplexityAnalyzer`

Defined in: [src/connectors/base-connector.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L55)

#### Inherited from

`BaseConnector.queryAnalyzer`

***

### queryTimeout

> `protected` `readonly` **queryTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:50](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L50)

#### Inherited from

`BaseConnector.queryTimeout`

***

### requireSSL

> `protected` `readonly` **requireSSL**: `boolean`

Defined in: [src/connectors/base-connector.ts:52](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L52)

#### Inherited from

`BaseConnector.requireSSL`

***

### schemaCache

> `protected` `readonly` **schemaCache**: `SchemaCache`

Defined in: [src/connectors/base-connector.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L56)

#### Inherited from

`BaseConnector.schemaCache`

## Methods

### cleanup()

> `protected` **cleanup**(): `void`

Defined in: [src/connectors/base-connector.ts:812](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L812)

Cleanup resources (should be called by subclasses in their close method)

#### Returns

`void`

#### Inherited from

`BaseConnector.cleanup`

***

### clearSchemaCache()

> `protected` **clearSchemaCache**(): `void`

Defined in: [src/connectors/base-connector.ts:798](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L798)

Clear schema cache for testing or maintenance

#### Returns

`void`

#### Inherited from

`BaseConnector.clearSchemaCache`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/connectors/postgres.ts:396](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L396)

Close the database connection

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseConnector.close`

***

### ~~connectLegacy()~~

> **connectLegacy**(`credentials`): `Promise`\<`void`\>

Defined in: [src/connectors/postgres.ts:455](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L455)

Legacy connect method for backward compatibility

#### Parameters

##### credentials

[`SourceCredentials`](../interfaces/SourceCredentials.md)

#### Returns

`Promise`\<`void`\>

#### Deprecated

Use constructor with ConnectorConfig instead

***

### createDebugErrorFactory()

> `protected` **createDebugErrorFactory**(`debugConfig?`): `DebugErrorFactory`

Defined in: [src/connectors/base-connector.ts:849](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L849)

Helper method for subclasses to create debug-enabled error factory

#### Parameters

##### debugConfig?

`DebugConfig`

#### Returns

`DebugErrorFactory`

#### Inherited from

`BaseConnector.createDebugErrorFactory`

***

### escapeIdentifier()

> `protected` **escapeIdentifier**(`identifier`): `string`

Defined in: [src/connectors/base-connector.ts:481](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L481)

Escape SQL identifiers to prevent injection

#### Parameters

##### identifier

`string`

#### Returns

`string`

#### Inherited from

`BaseConnector.escapeIdentifier`

***

### executeParameterizedQuery()

> `protected` **executeParameterizedQuery**(`sql`, `parameters?`): `Promise`\<`QueryResultRow`[]\>

Defined in: [src/connectors/postgres.ts:121](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L121)

Execute a parameterized SQL query using prepared statements

#### Parameters

##### sql

`string`

##### parameters?

`unknown`[] = `[]`

#### Returns

`Promise`\<`QueryResultRow`[]\>

#### Overrides

`BaseConnector.executeParameterizedQuery`

***

### executeQuery()

> `protected` **executeQuery**(`sql`): `Promise`\<`QueryResultRow`[]\>

Defined in: [src/connectors/postgres.ts:114](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L114)

Execute a validated SQL query with security measures

#### Parameters

##### sql

`string`

#### Returns

`Promise`\<`QueryResultRow`[]\>

#### Overrides

`BaseConnector.executeQuery`

***

### executeWithTimeout()

> `protected` **executeWithTimeout**\<`T`\>(`operation`, `timeoutMs`): `Promise`\<`T`\>

Defined in: [src/connectors/base-connector.ts:498](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L498)

Execute function with timeout protection

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

##### timeoutMs

`number`

#### Returns

`Promise`\<`T`\>

#### Inherited from

`BaseConnector.executeWithTimeout`

***

### getLastModified()

> **getLastModified**(`table`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/postgres.ts:349](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L349)

Get last modified timestamp using PostgreSQL-specific methods

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Overrides

`BaseConnector.getLastModified`

***

### getMaxTimestamp()

> **getMaxTimestamp**(`table`, `column`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/base-connector.ts:612](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L612)

Get maximum timestamp value from a column

#### Parameters

##### table

`string`

##### column

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Inherited from

`BaseConnector.getMaxTimestamp`

***

### getMinTimestamp()

> **getMinTimestamp**(`table`, `column`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/base-connector.ts:680](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L680)

Get minimum timestamp value from a column

#### Parameters

##### table

`string`

##### column

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Inherited from

`BaseConnector.getMinTimestamp`

***

### getQueryAnalyzerConfig()

> `protected` **getQueryAnalyzerConfig**(): `QueryAnalyzerConfig`

Defined in: [src/connectors/base-connector.ts:805](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L805)

Get query analyzer configuration

#### Returns

`QueryAnalyzerConfig`

#### Inherited from

`BaseConnector.getQueryAnalyzerConfig`

***

### getRowCount()

> **getRowCount**(`table`): `Promise`\<`number`\>

Defined in: [src/connectors/base-connector.ts:554](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L554)

Get row count for a table using parameterized query

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`number`\>

#### Inherited from

`BaseConnector.getRowCount`

***

### getSchemaCacheStats()

> `protected` **getSchemaCacheStats**(): `CacheStats`

Defined in: [src/connectors/base-connector.ts:791](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L791)

Get schema cache statistics

#### Returns

`CacheStats`

#### Inherited from

`BaseConnector.getSchemaCacheStats`

***

### ~~getTableMetadata()~~

> **getTableMetadata**(`tableName`, `timestampColumn?`): `Promise`\<\{ `lastUpdate?`: `Date`; `rowCount`: `number`; \}\>

Defined in: [src/connectors/postgres.ts:509](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L509)

Legacy get table metadata method for backward compatibility

#### Parameters

##### tableName

`string`

##### timestampColumn?

`string` = `'updated_at'`

#### Returns

`Promise`\<\{ `lastUpdate?`: `Date`; `rowCount`: `number`; \}\>

#### Deprecated

Use getRowCount() and getMaxTimestamp() instead

***

### getTableMetadataFresh()

> `protected` **getTableMetadataFresh**(`tableName`): `Promise`\<`TableMetadata` \| `null`\>

Defined in: [src/connectors/base-connector.ts:336](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L336)

Get fresh table metadata (to be overridden by specific connectors)

#### Parameters

##### tableName

`string`

#### Returns

`Promise`\<`TableMetadata` \| `null`\>

#### Inherited from

`BaseConnector.getTableMetadataFresh`

***

### getTableSchema()

> **getTableSchema**(`table`): `Promise`\<`TableSchema`\>

Defined in: [src/connectors/postgres.ts:299](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L299)

Get table schema information securely

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`TableSchema`\>

#### Overrides

`BaseConnector.getTableSchema`

***

### listTables()

> **listTables**(): `Promise`\<`string`[]\>

Defined in: [src/connectors/postgres.ts:272](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L272)

List all tables in the public schema

#### Returns

`Promise`\<`string`[]\>

#### Overrides

`BaseConnector.listTables`

***

### logDebugError()

> `protected` **logDebugError**(`debugConfig`, `debugId`, `operation`, `context`): `void`

Defined in: [src/connectors/base-connector.ts:866](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L866)

Helper method for subclasses to log debug errors

#### Parameters

##### debugConfig

`DebugConfig` | `undefined`

##### debugId

`string`

##### operation

`string`

##### context

`Record`\<`string`, `unknown`\>

#### Returns

`void`

#### Inherited from

`BaseConnector.logDebugError`

***

### logDebugInfo()

> `protected` **logDebugInfo**(`debugConfig`, `debugId`, `operation`, `context`): `void`

Defined in: [src/connectors/base-connector.ts:857](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L857)

Helper method for subclasses to log debug information

#### Parameters

##### debugConfig

`DebugConfig` | `undefined`

##### debugId

`string`

##### operation

`string`

##### context

`Record`\<`string`, `unknown`\>

#### Returns

`void`

#### Inherited from

`BaseConnector.logDebugInfo`

***

### logError()

> `protected` **logError**(`operation`, `error`, `context?`): `void`

Defined in: [src/connectors/base-connector.ts:780](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L780)

Helper method for specific connectors to log errors with consistent format

#### Parameters

##### operation

`string`

##### error

`Error`

##### context?

`LogContext`

#### Returns

`void`

#### Inherited from

`BaseConnector.logError`

***

### logOperation()

> `protected` **logOperation**(`operation`, `context`): `void`

Defined in: [src/connectors/base-connector.ts:769](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L769)

Helper method for specific connectors to log operations with consistent format

#### Parameters

##### operation

`string`

##### context

`LogContext`

#### Returns

`void`

#### Inherited from

`BaseConnector.logOperation`

***

### ~~query()~~

> **query**\<`T`\>(`_sql`): `Promise`\<`T`[]\>

Defined in: [src/connectors/postgres.ts:538](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L538)

Legacy query method for backward compatibility

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### \_sql

`string`

#### Returns

`Promise`\<`T`[]\>

#### Deprecated

Direct SQL queries are not allowed for security reasons

***

### sanitizeError()

> `protected` **sanitizeError**(`error`): `string`

Defined in: [src/connectors/base-connector.ts:515](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L515)

Sanitize error messages to prevent information leakage

#### Parameters

##### error

`unknown`

#### Returns

`string`

#### Inherited from

`BaseConnector.sanitizeError`

***

### testConnection()

> **testConnection**(`debugConfig?`): `Promise`\<`boolean`\>

Defined in: [src/connectors/postgres.ts:161](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L161)

Test database connection with security validation

#### Parameters

##### debugConfig?

`DebugConfig`

#### Returns

`Promise`\<`boolean`\>

#### Overrides

`BaseConnector.testConnection`

***

### ~~testConnectionLegacy()~~

> **testConnectionLegacy**(): `Promise`\<\{ `error?`: `string`; `success`: `boolean`; `tableCount?`: `number`; \}\>

Defined in: [src/connectors/postgres.ts:478](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/postgres.ts#L478)

Legacy test connection method for backward compatibility

#### Returns

`Promise`\<\{ `error?`: `string`; `success`: `boolean`; `tableCount?`: `number`; \}\>

#### Deprecated

Use testConnection() instead

***

### validateQuery()

> `protected` **validateQuery**(`sql`, `tableNames?`): `Promise`\<`void`\>

Defined in: [src/connectors/base-connector.ts:159](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L159)

Validate SQL query against security rules with enhanced analysis

Combines traditional pattern matching with advanced query complexity analysis

#### Parameters

##### sql

`string`

##### tableNames?

`string`[] = `[]`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`BaseConnector.validateQuery`

***

### validateResultSize()

> `protected` **validateResultSize**(`results`): `void`

Defined in: [src/connectors/base-connector.ts:748](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/base-connector.ts#L748)

Validate that query results don't exceed max rows limit

#### Parameters

##### results

`QueryResultRow`[]

#### Returns

`void`

#### Inherited from

`BaseConnector.validateResultSize`
