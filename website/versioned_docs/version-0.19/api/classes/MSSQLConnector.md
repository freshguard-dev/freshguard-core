# Class: MSSQLConnector

Defined in: [src/connectors/mssql.ts:59](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L59)

Secure SQL Server connector

Features:
- SQL injection prevention
- Connection timeouts
- SSL enforcement
- Read-only query patterns
- Secure error handling
- Connection pooling via mssql

## Example

```typescript
import { MSSQLConnector } from '@freshguard/freshguard-core';

// Username/password auth
const connector = new MSSQLConnector({
  host: 'sql-server.example.com', port: 1433,
  database: 'analytics',
  username: 'readonly',
  password: process.env.MSSQL_PASSWORD!,
  ssl: true,
});

// Entra Service Principal auth
const spConnector = new MSSQLConnector({
  host: 'myserver.database.windows.net', port: 1433,
  database: 'analytics',
  username: '', password: '', ssl: true,
  options: {
    authentication: {
      type: 'azure-active-directory-service-principal-secret',
      options: { tenantId: '...', clientId: '...', clientSecret: '...' },
    },
  },
});
```

## Extends

- `BaseConnector`

## Constructors

### Constructor

> **new MSSQLConnector**(`config`, `securityConfig?`): `MSSQLConnector`

Defined in: [src/connectors/mssql.ts:69](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L69)

#### Parameters

##### config

`ConnectorConfig`

Database connection settings (host, port, database, credentials).
  Pass `options.schema` to target a specific schema (default: `'dbo'`).

##### securityConfig?

`Partial`\<`SecurityConfig`\>

Optional overrides for query timeouts, max rows, SSL, and blocked keywords

#### Returns

`MSSQLConnector`

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

Defined in: [src/connectors/mssql.ts:435](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L435)

Close the database connection

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseConnector.close`

***

### ~~connectLegacy()~~

> **connectLegacy**(`credentials`): `Promise`\<`void`\>

Defined in: [src/connectors/mssql.ts:529](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L529)

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

Defined in: [src/connectors/mssql.ts:506](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L506)

Override escapeIdentifier for SQL Server bracket notation

#### Parameters

##### identifier

`string`

#### Returns

`string`

#### Overrides

`BaseConnector.escapeIdentifier`

***

### executeParameterizedQuery()

> `protected` **executeParameterizedQuery**(`sql`, `parameters?`): `Promise`\<`QueryResultRow`[]\>

Defined in: [src/connectors/mssql.ts:139](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L139)

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

Defined in: [src/connectors/mssql.ts:132](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L132)

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

Defined in: [src/connectors/mssql.ts:390](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L390)

Get last modified timestamp using SQL Server-specific methods

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

Defined in: [src/connectors/mssql.ts:583](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L583)

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

Defined in: [src/connectors/mssql.ts:340](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L340)

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

Defined in: [src/connectors/mssql.ts:310](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L310)

List all tables in the database

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

Defined in: [src/connectors/mssql.ts:612](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L612)

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

Defined in: [src/connectors/mssql.ts:194](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L194)

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

Defined in: [src/connectors/mssql.ts:552](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/connectors/mssql.ts#L552)

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
