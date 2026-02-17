# Class: BigQueryConnector

Defined in: [src/connectors/bigquery.ts:48](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L48)

Secure BigQuery connector

Connects to Google BigQuery using Application Default Credentials or a
service-account key. The `database` field in the config is the GCP project ID.

Features:
- SQL injection prevention
- Credential validation
- Read-only query patterns
- Connection timeouts
- Secure error handling

## Example

```typescript
import { BigQueryConnector } from '@freshguard/freshguard-core';

const connector = new BigQueryConnector({
  host: 'bigquery.googleapis.com', port: 443,
  database: 'my-gcp-project',
  username: 'service-account@project.iam.gserviceaccount.com',
  password: process.env.BQ_KEY!,
});
```

## Extends

- `BaseConnector`

## Constructors

### Constructor

> **new BigQueryConnector**(`config`, `securityConfig?`): `BigQueryConnector`

Defined in: [src/connectors/bigquery.ts:64](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L64)

#### Parameters

##### config

`ConnectorConfig`

Connection config; `database` is the GCP project ID.
  Pass `options.location` (e.g. `'EU'`, `'us-central1'`) to target a
  specific BigQuery region.  When omitted, the location is auto-detected
  from the first accessible dataset; if no datasets exist the default
  `'US'` is used for backward compatibility.

##### securityConfig?

`Partial`\<`SecurityConfig`\>

Optional overrides for query timeouts, max rows, and blocked keywords

#### Returns

`BigQueryConnector`

#### Overrides

`BaseConnector.constructor`

## Properties

### config

> `protected` **config**: `ConnectorConfig`

Defined in: [src/connectors/base-connector.ts:63](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L63)

#### Inherited from

`BaseConnector.config`

***

### connectionTimeout

> `protected` `readonly` **connectionTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:49](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L49)

#### Inherited from

`BaseConnector.connectionTimeout`

***

### enableDetailedLogging

> `protected` `readonly` **enableDetailedLogging**: `boolean`

Defined in: [src/connectors/base-connector.ts:57](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L57)

#### Inherited from

`BaseConnector.enableDetailedLogging`

***

### enableQueryAnalysis

> `protected` `readonly` **enableQueryAnalysis**: `boolean`

Defined in: [src/connectors/base-connector.ts:58](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L58)

#### Inherited from

`BaseConnector.enableQueryAnalysis`

***

### logger

> `protected` `readonly` **logger**: `StructuredLogger`

Defined in: [src/connectors/base-connector.ts:53](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L53)

#### Inherited from

`BaseConnector.logger`

***

### maxRows

> `protected` `readonly` **maxRows**: `number`

Defined in: [src/connectors/base-connector.ts:51](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L51)

#### Inherited from

`BaseConnector.maxRows`

***

### metrics

> `protected` `readonly` **metrics**: `MetricsCollector`

Defined in: [src/connectors/base-connector.ts:54](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L54)

#### Inherited from

`BaseConnector.metrics`

***

### queryAnalyzer

> `protected` `readonly` **queryAnalyzer**: `QueryComplexityAnalyzer`

Defined in: [src/connectors/base-connector.ts:55](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L55)

#### Inherited from

`BaseConnector.queryAnalyzer`

***

### queryTimeout

> `protected` `readonly` **queryTimeout**: `number`

Defined in: [src/connectors/base-connector.ts:50](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L50)

#### Inherited from

`BaseConnector.queryTimeout`

***

### requireSSL

> `protected` `readonly` **requireSSL**: `boolean`

Defined in: [src/connectors/base-connector.ts:52](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L52)

#### Inherited from

`BaseConnector.requireSSL`

***

### schemaCache

> `protected` `readonly` **schemaCache**: `SchemaCache`

Defined in: [src/connectors/base-connector.ts:56](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L56)

#### Inherited from

`BaseConnector.schemaCache`

## Methods

### cleanup()

> `protected` **cleanup**(): `void`

Defined in: [src/connectors/base-connector.ts:806](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L806)

Cleanup resources (should be called by subclasses in their close method)

#### Returns

`void`

#### Inherited from

`BaseConnector.cleanup`

***

### clearSchemaCache()

> `protected` **clearSchemaCache**(): `void`

Defined in: [src/connectors/base-connector.ts:792](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L792)

Clear schema cache for testing or maintenance

#### Returns

`void`

#### Inherited from

`BaseConnector.clearSchemaCache`

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [src/connectors/bigquery.ts:551](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L551)

Close the BigQuery connection

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseConnector.close`

***

### ~~connectLegacy()~~

> **connectLegacy**(`credentials`): `Promise`\<`void`\>

Defined in: [src/connectors/bigquery.ts:659](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L659)

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

Defined in: [src/connectors/base-connector.ts:843](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L843)

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

Defined in: [src/connectors/bigquery.ts:599](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L599)

Override escapeIdentifier for BigQuery.
Backtick-quotes identifiers that contain dots or hyphens (fully-qualified
BigQuery table references like project.dataset.table).
Plain column names are handled by the base implementation.

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

Defined in: [src/connectors/bigquery.ts:205](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L205)

Execute a parameterized SQL query using BigQuery's named parameters

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

Defined in: [src/connectors/bigquery.ts:278](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L278)

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

Defined in: [src/connectors/base-connector.ts:492](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L492)

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

### getDataset()

> **getDataset**(): `string` \| `undefined`

Defined in: [src/connectors/bigquery.ts:799](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L799)

Get the currently configured dataset, or `undefined` if not set.

#### Returns

`string` \| `undefined`

***

### getLastModified()

> **getLastModified**(`table`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/bigquery.ts:510](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L510)

Get last modified timestamp for BigQuery tables
Uses BigQuery's table metadata when possible

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Overrides

`BaseConnector.getLastModified`

***

### getLocation()

> **getLocation**(): `string`

Defined in: [src/connectors/bigquery.ts:779](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L779)

Get current BigQuery location/region

#### Returns

`string`

***

### getMaxTimestamp()

> **getMaxTimestamp**(`table`, `column`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/bigquery.ts:611](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L611)

Get maximum timestamp value from a column

#### Parameters

##### table

`string`

##### column

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Overrides

`BaseConnector.getMaxTimestamp`

***

### getMinTimestamp()

> **getMinTimestamp**(`table`, `column`): `Promise`\<`Date` \| `null`\>

Defined in: [src/connectors/bigquery.ts:615](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L615)

Get minimum timestamp value from a column

#### Parameters

##### table

`string`

##### column

`string`

#### Returns

`Promise`\<`Date` \| `null`\>

#### Overrides

`BaseConnector.getMinTimestamp`

***

### getProjectId()

> **getProjectId**(): `string`

Defined in: [src/connectors/bigquery.ts:764](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L764)

Get BigQuery project ID

#### Returns

`string`

***

### getQueryAnalyzerConfig()

> `protected` **getQueryAnalyzerConfig**(): `QueryAnalyzerConfig`

Defined in: [src/connectors/base-connector.ts:799](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L799)

Get query analyzer configuration

#### Returns

`QueryAnalyzerConfig`

#### Inherited from

`BaseConnector.getQueryAnalyzerConfig`

***

### getRowCount()

> **getRowCount**(`table`): `Promise`\<`number`\>

Defined in: [src/connectors/bigquery.ts:607](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L607)

Get row count for a table using parameterized query

#### Parameters

##### table

`string`

#### Returns

`Promise`\<`number`\>

#### Overrides

`BaseConnector.getRowCount`

***

### getSchemaCacheStats()

> `protected` **getSchemaCacheStats**(): `CacheStats`

Defined in: [src/connectors/base-connector.ts:785](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L785)

Get schema cache statistics

#### Returns

`CacheStats`

#### Inherited from

`BaseConnector.getSchemaCacheStats`

***

### ~~getTableMetadata()~~

> **getTableMetadata**(`tableName`, `timestampColumn?`): `Promise`\<\{ `lastUpdate?`: `Date`; `rowCount`: `number`; \}\>

Defined in: [src/connectors/bigquery.ts:726](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L726)

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

Defined in: [src/connectors/base-connector.ts:330](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L330)

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

Defined in: [src/connectors/bigquery.ts:450](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L450)

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

Defined in: [src/connectors/bigquery.ts:406](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L406)

List all tables in the project, or in a single dataset when one is set.

When a dataset is configured (via `options.dataset` or [setDataset](#setdataset)),
the query targets `{project}.{dataset}.INFORMATION_SCHEMA.TABLES` which
only requires dataset-level permissions.  Without a dataset the query
targets `{project}.INFORMATION_SCHEMA.TABLES` (project-wide).

#### Returns

`Promise`\<`string`[]\>

#### Overrides

`BaseConnector.listTables`

***

### logDebugError()

> `protected` **logDebugError**(`debugConfig`, `debugId`, `operation`, `context`): `void`

Defined in: [src/connectors/base-connector.ts:860](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L860)

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

Defined in: [src/connectors/base-connector.ts:851](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L851)

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

Defined in: [src/connectors/base-connector.ts:774](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L774)

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

Defined in: [src/connectors/base-connector.ts:763](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L763)

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

Defined in: [src/connectors/bigquery.ts:755](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L755)

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

Defined in: [src/connectors/base-connector.ts:509](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L509)

Sanitize error messages to prevent information leakage

#### Parameters

##### error

`unknown`

#### Returns

`string`

#### Inherited from

`BaseConnector.sanitizeError`

***

### setDataset()

> **setDataset**(`dataset`): `void`

Defined in: [src/connectors/bigquery.ts:791](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L791)

Scope subsequent `listTables()` calls to a single dataset.

When a dataset is set, `listTables()` queries
`{project}.{dataset}.INFORMATION_SCHEMA.TABLES` instead of the
project-wide `INFORMATION_SCHEMA.TABLES`.  This is required when the
service account only has dataset-level permissions.

#### Parameters

##### dataset

`string`

#### Returns

`void`

***

### setLocation()

> **setLocation**(`location`): `void`

Defined in: [src/connectors/bigquery.ts:771](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L771)

Set BigQuery location/region

#### Parameters

##### location

`string`

#### Returns

`void`

***

### testConnection()

> **testConnection**(`debugConfig?`): `Promise`\<`boolean`\>

Defined in: [src/connectors/bigquery.ts:285](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L285)

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

Defined in: [src/connectors/bigquery.ts:695](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/bigquery.ts#L695)

Legacy test connection method for backward compatibility

#### Returns

`Promise`\<\{ `error?`: `string`; `success`: `boolean`; `tableCount?`: `number`; \}\>

#### Deprecated

Use testConnection() instead

***

### validateQuery()

> `protected` **validateQuery**(`sql`, `tableNames?`): `Promise`\<`void`\>

Defined in: [src/connectors/base-connector.ts:153](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L153)

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

Defined in: [src/connectors/base-connector.ts:742](https://github.com/freshguard-dev/freshguard-core/blob/4b33016e6819f80615e9abb2612eda3b26c2786c/src/connectors/base-connector.ts#L742)

Validate that query results don't exceed max rows limit

#### Parameters

##### results

`QueryResultRow`[]

#### Returns

`void`

#### Inherited from

`BaseConnector.validateResultSize`
