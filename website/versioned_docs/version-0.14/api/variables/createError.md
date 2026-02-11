# Variable: createError

> `const` **createError**: `object`

Defined in: [src/errors/index.ts:618](https://github.com/freshguard-dev/freshguard-core/blob/49fe45ba5f2e729bb2b3a01a6a09fc4a61156cec/src/errors/index.ts#L618)

Create standardized error instances

## Type Declaration

### config

> **config**: `object`

#### config.invalidFormat()

> **invalidFormat**: (`field`, `format`) => [`ConfigurationError`](../classes/ConfigurationError.md)

##### Parameters

###### field

`string`

###### format

`string`

##### Returns

[`ConfigurationError`](../classes/ConfigurationError.md)

#### config.invalidValue()

> **invalidValue**: (`field`, `value`, `expected`) => [`ConfigurationError`](../classes/ConfigurationError.md)

##### Parameters

###### field

`string`

###### value

`string`

###### expected

`string`

##### Returns

[`ConfigurationError`](../classes/ConfigurationError.md)

#### config.missingRequired()

> **missingRequired**: (`field`) => [`ConfigurationError`](../classes/ConfigurationError.md)

##### Parameters

###### field

`string`

##### Returns

[`ConfigurationError`](../classes/ConfigurationError.md)

### connection

> **connection**: `object`

#### connection.authFailed()

> **authFailed**: (`host`) => [`ConnectionError`](../classes/ConnectionError.md)

##### Parameters

###### host

`string`

##### Returns

[`ConnectionError`](../classes/ConnectionError.md)

#### connection.databaseNotFound()

> **databaseNotFound**: (`database`, `host`) => [`ConnectionError`](../classes/ConnectionError.md)

##### Parameters

###### database

`string`

###### host

`string`

##### Returns

[`ConnectionError`](../classes/ConnectionError.md)

#### connection.hostUnreachable()

> **hostUnreachable**: (`host`, `port?`) => [`ConnectionError`](../classes/ConnectionError.md)

##### Parameters

###### host

`string`

###### port?

`number`

##### Returns

[`ConnectionError`](../classes/ConnectionError.md)

### metadata

> **metadata**: `object`

#### metadata.connectionFailed()

> **connectionFailed**: (`originalError?`) => `MetadataStorageError`

##### Parameters

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

#### metadata.getHistoricalDataFailed()

> **getHistoricalDataFailed**: (`ruleId`, `days`, `originalError?`) => `MetadataStorageError`

##### Parameters

###### ruleId

`string`

###### days

`number`

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

#### metadata.getRuleFailed()

> **getRuleFailed**: (`ruleId`, `originalError?`) => `MetadataStorageError`

##### Parameters

###### ruleId

`string`

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

#### metadata.initializationFailed()

> **initializationFailed**: (`reason?`) => `MetadataStorageError`

##### Parameters

###### reason?

`string`

##### Returns

`MetadataStorageError`

#### metadata.migrationFailed()

> **migrationFailed**: (`version?`, `originalError?`) => `MetadataStorageError`

##### Parameters

###### version?

`string`

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

#### metadata.saveExecutionFailed()

> **saveExecutionFailed**: (`ruleId`, `originalError?`) => `MetadataStorageError`

##### Parameters

###### ruleId

`string`

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

#### metadata.saveRuleFailed()

> **saveRuleFailed**: (`ruleId`, `originalError?`) => `MetadataStorageError`

##### Parameters

###### ruleId

`string`

###### originalError?

`Error`

##### Returns

`MetadataStorageError`

### monitoring

> **monitoring**: `object`

#### monitoring.freshnessCheckFailed()

> **freshnessCheckFailed**: (`table`, `reason`) => [`MonitoringError`](../classes/MonitoringError.md)

##### Parameters

###### table

`string`

###### reason

`string`

##### Returns

[`MonitoringError`](../classes/MonitoringError.md)

#### monitoring.volumeCheckFailed()

> **volumeCheckFailed**: (`table`, `reason`) => [`MonitoringError`](../classes/MonitoringError.md)

##### Parameters

###### table

`string`

###### reason

`string`

##### Returns

[`MonitoringError`](../classes/MonitoringError.md)

### query

> **query**: `object`

#### query.columnNotFound()

> **columnNotFound**: (`column`, `table`) => [`QueryError`](../classes/QueryError.md)

##### Parameters

###### column

`string`

###### table

`string`

##### Returns

[`QueryError`](../classes/QueryError.md)

#### query.resultTooLarge()

> **resultTooLarge**: (`maxRows`, `table?`) => [`QueryError`](../classes/QueryError.md)

##### Parameters

###### maxRows

`number`

###### table?

`string`

##### Returns

[`QueryError`](../classes/QueryError.md)

#### query.tableNotFound()

> **tableNotFound**: (`table`) => [`QueryError`](../classes/QueryError.md)

##### Parameters

###### table

`string`

##### Returns

[`QueryError`](../classes/QueryError.md)

### security

> **security**: `object`

#### security.blockedQuery()

> **blockedQuery**: (`keyword`) => [`SecurityError`](../classes/SecurityError.md)

##### Parameters

###### keyword

`string`

##### Returns

[`SecurityError`](../classes/SecurityError.md)

#### security.invalidIdentifier()

> **invalidIdentifier**: (`name`) => [`SecurityError`](../classes/SecurityError.md)

##### Parameters

###### name

`string`

##### Returns

[`SecurityError`](../classes/SecurityError.md)

#### security.queryNotAllowed()

> **queryNotAllowed**: () => [`SecurityError`](../classes/SecurityError.md)

##### Returns

[`SecurityError`](../classes/SecurityError.md)

#### security.sslRequired()

> **sslRequired**: () => [`SecurityError`](../classes/SecurityError.md)

##### Returns

[`SecurityError`](../classes/SecurityError.md)

### timeout

> **timeout**: `object`

#### timeout.connection()

> **connection**: (`timeoutMs`) => [`TimeoutError`](../classes/TimeoutError.md)

##### Parameters

###### timeoutMs

`number`

##### Returns

[`TimeoutError`](../classes/TimeoutError.md)

#### timeout.query()

> **query**: (`timeoutMs`) => [`TimeoutError`](../classes/TimeoutError.md)

##### Parameters

###### timeoutMs

`number`

##### Returns

[`TimeoutError`](../classes/TimeoutError.md)
