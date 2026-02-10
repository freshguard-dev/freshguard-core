# Class: DuckDBConnector

Defined in: [src/connectors/duckdb.ts:35](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L35)

Secure DuckDB connector

Features:
- SQL injection prevention
- File path validation
- Read-only query patterns
- Connection timeouts
- Secure error handling

## Extends

- `BaseConnector`

## Constructors

### Constructor

> **new DuckDBConnector**(`config`, `securityConfig?`): `DuckDBConnector`

Defined in: [src/connectors/duckdb.ts:41](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L41)

#### Parameters

##### config

`ConnectorConfig`

##### securityConfig?

`Partial`\<`SecurityConfig`\>

#### Returns

`DuckDBConnector`

#### Overrides

`BaseConnector.constructor`

## Properties

### config

> `protected` **config**: `ConnectorConfig`

Defined in: [src/connectors/base-connector.ts:63](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L63)

#### Inherited from

`BaseConnector.config`

***

### connectionTimeout

> `protected` `readonly` **connectionTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:49](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L49)

#### Inherited from

`BaseConnector.connectionTimeout`

***

### enableDetailedLogging

> `protected` `readonly` **enableDetailedLogging**: `boolean`

Defined in: [src/connectors/base-connector.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L57)

#### Inherited from

`BaseConnector.enableDetailedLogging`

***

### enableQueryAnalysis

> `protected` `readonly` **enableQueryAnalysis**: `boolean`

Defined in: [src/connectors/base-connector.ts:58](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L58)

#### Inherited from

`BaseConnector.enableQueryAnalysis`

***

### logger

> `protected` `readonly` **logger**: `StructuredLogger`

Defined in: [src/connectors/base-connector.ts:53](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L53)

#### Inherited from

`BaseConnector.logger`

***

### maxRows

> `protected` `readonly` **maxRows**: `number`

Defined in: [src/connectors/base-connector.ts:51](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L51)

#### Inherited from

`BaseConnector.maxRows`

***

### metrics

> `protected` `readonly` **metrics**: `MetricsCollector`

Defined in: [src/connectors/base-connector.ts:54](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L54)

#### Inherited from

`BaseConnector.metrics`

***

### queryAnalyzer

> `protected` `readonly` **queryAnalyzer**: `QueryComplexityAnalyzer`

Defined in: [src/connectors/base-connector.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L55)

#### Inherited from

`BaseConnector.queryAnalyzer`

***

### queryTimeout

> `protected` `readonly` **queryTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:50](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L50)

#### Inherited from

`BaseConnector.queryTimeout`

***

### requireSSL

> `protected` `readonly` **requireSSL**: `boolean`

Defined in: [src/connectors/base-connector.ts:52](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L52)

#### Inherited from

`BaseConnector.requireSSL`

***

### schemaCache

> `protected` `readonly` **schemaCache**: `SchemaCache`

Defined in: [src/connectors/base-connector.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L56)

#### Inherited from

`BaseConnector.schemaCache`

## Methods

### cleanup()

> `protected` **cleanup**(): `void`

Defined in: [src/connectors/base-connector.ts:806](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L806)

Cleanup resources (should be called by subclasses in their close method)

#### Returns

`void`

#### Inherited from

`BaseConnector.cleanup`

***

### clearSchemaCache()

> `protected` **clearSchemaCache**(): `void`

Defined in: [src/connectors/base-connector.ts:792](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L792)

Clear schema cache for testing or maintenance

#### Returns

`void`

#### Inherited from

`BaseConnector.clearSchemaCache`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/connectors/duckdb.ts:436](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L436)

Close the database connection

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseConnector.close`

***

### ~~connectLegacy()~~

> **connectLegacy**(`credentials`): `Promise`\<`void`\>

Defined in: [src/connectors/duckdb.ts:503](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L503)

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

Defined in: [src/connectors/base-connector.ts:843](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L843)

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

Defined in: [src/connectors/base-connector.ts:475](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L475)

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

Defined in: [src/connectors/duckdb.ts:143](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L143)

Execute a parameterized SQL query (DuckDB with manual parameter substitution)
Note: DuckDB node API has limited prepared statement support, so we use safe parameter substitution

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

Defined in: [src/connectors/duckdb.ts:135](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L135)

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

Defined in: [src/connectors/base-connector.ts:492](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L492)

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

### getDatabasePath()

> **getDatabasePath**(): `string`

Defined in: [src/connectors/duckdb.ts:601](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L601)

Get database file path (DuckDB-specific utility)

#### Returns

`string`

***

### getLastModified()

> **getLastModified**(`table`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/duckdb.ts:409](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L409)

Get last modified timestamp for DuckDB
Since DuckDB doesn't have built-in table modification timestamps,
we'll look for common timestamp columns

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

Defined in: [src/connectors/base-connector.ts:606](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L606)

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

Defined in: [src/connectors/base-connector.ts:674](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L674)

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

Defined in: [src/connectors/base-connector.ts:799](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L799)

Get query analyzer configuration

#### Returns

`QueryAnalyzerConfig`

#### Inherited from

`BaseConnector.getQueryAnalyzerConfig`

***

### getRowCount()

> **getRowCount**(`table`): `Promise`\<`number`\>

Defined in: [src/connectors/base-connector.ts:548](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L548)

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

Defined in: [src/connectors/base-connector.ts:785](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L785)

Get schema cache statistics

#### Returns

`CacheStats`

#### Inherited from

`BaseConnector.getSchemaCacheStats`

***

### ~~getTableMetadata()~~

> **getTableMetadata**(`tableName`, `timestampColumn?`): `Promise`\<\{ `lastUpdate?`: `Date`; `rowCount`: `number`; \}\>

Defined in: [src/connectors/duckdb.ts:560](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L560)

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

Defined in: [src/connectors/base-connector.ts:330](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L330)

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

Defined in: [src/connectors/duckdb.ts:357](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L357)

Get table schema information securely

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`TableSchema`\>

#### Overrides

`BaseConnector.getTableSchema`

***

### isInMemory()

> **isInMemory**(): `boolean`

Defined in: [src/connectors/duckdb.ts:608](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L608)

Check if database is in-memory

#### Returns

`boolean`

***

### listTables()

> **listTables**(): `Promise`\<`string`[]\>

Defined in: [src/connectors/duckdb.ts:330](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L330)

List all tables in the database (excluding system schemas)

#### Returns

`Promise`\<`string`[]\>

#### Overrides

`BaseConnector.listTables`

***

### logDebugError()

> `protected` **logDebugError**(`debugConfig`, `debugId`, `operation`, `context`): `void`

Defined in: [src/connectors/base-connector.ts:860](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L860)

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

Defined in: [src/connectors/base-connector.ts:851](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L851)

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

Defined in: [src/connectors/base-connector.ts:774](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L774)

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

Defined in: [src/connectors/base-connector.ts:763](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L763)

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

Defined in: [src/connectors/duckdb.ts:592](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L592)

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

Defined in: [src/connectors/base-connector.ts:509](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L509)

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

Defined in: [src/connectors/duckdb.ts:206](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L206)

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

Defined in: [src/connectors/duckdb.ts:529](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/duckdb.ts#L529)

Legacy test connection method for backward compatibility

#### Returns

`Promise`\<\{ `error?`: `string`; `success`: `boolean`; `tableCount?`: `number`; \}\>

#### Deprecated

Use testConnection() instead

***

### validateQuery()

> `protected` **validateQuery**(`sql`, `tableNames?`): `Promise`\<`void`\>

Defined in: [src/connectors/base-connector.ts:153](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L153)

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

Defined in: [src/connectors/base-connector.ts:742](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/connectors/base-connector.ts#L742)

Validate that query results don't exceed max rows limit

#### Parameters

##### results

`QueryResultRow`[]

#### Returns

`void`

#### Inherited from

`BaseConnector.validateResultSize`
