# @freshguard/freshguard-core

## Namespaces

| Namespace | Description |
| ------ | ------ |
| [schema](@freshguard/namespaces/schema/index.md) | - |

## Classes

| Class | Description |
| ------ | ------ |
| [AzureSQLConnector](classes/AzureSQLConnector.md) | Secure Azure SQL Database connector |
| [BigQueryConnector](classes/BigQueryConnector.md) | Secure BigQuery connector |
| [ConfigurationError](classes/ConfigurationError.md) | Error for configuration and validation issues |
| [ConnectionError](classes/ConnectionError.md) | Error for database connection issues |
| [DuckDBConnector](classes/DuckDBConnector.md) | Secure DuckDB connector |
| [DuckDBMetadataStorage](classes/DuckDBMetadataStorage.md) | - |
| [ErrorHandler](classes/ErrorHandler.md) | Utility class for error handling and sanitization |
| [FreshGuardError](classes/FreshGuardError.md) | Base class for all FreshGuard security-related errors |
| [MonitoringError](classes/MonitoringError.md) | Error for monitoring and check failures |
| [MSSQLConnector](classes/MSSQLConnector.md) | Secure SQL Server connector |
| [MySQLConnector](classes/MySQLConnector.md) | Secure MySQL connector |
| [PostgresConnector](classes/PostgresConnector.md) | Secure PostgreSQL connector |
| [PostgreSQLMetadataStorage](classes/PostgreSQLMetadataStorage.md) | - |
| [QueryError](classes/QueryError.md) | Error for query validation and execution issues |
| [RedshiftConnector](classes/RedshiftConnector.md) | Secure Redshift connector |
| [SecurityError](classes/SecurityError.md) | Error for SQL injection attempts and other security violations |
| [SnowflakeConnector](classes/SnowflakeConnector.md) | Secure Snowflake connector |
| [SynapseConnector](classes/SynapseConnector.md) | Secure Azure Synapse Analytics connector |
| [TimeoutError](classes/TimeoutError.md) | Error for operation timeouts |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [AlertDestination](interfaces/AlertDestination.md) | Alert destination configuration |
| [CheckExecution](interfaces/CheckExecution.md) | Check execution record (stored in database) |
| [CheckResult](interfaces/CheckResult.md) | Check execution result |
| [ColumnChange](interfaces/ColumnChange.md) | Column change detected in schema monitoring |
| [DataSource](interfaces/DataSource.md) | Data source configuration |
| [FreshGuardConfig](interfaces/FreshGuardConfig.md) | Self-hosting configuration file |
| [MetadataStorage](interfaces/MetadataStorage.md) | - |
| [MetadataStorageConfig](interfaces/MetadataStorageConfig.md) | - |
| [MonitoringRule](interfaces/MonitoringRule.md) | Monitoring rule configuration |
| [SchemaBaseline](interfaces/SchemaBaseline.md) | Schema baseline for comparison |
| [SchemaChanges](interfaces/SchemaChanges.md) | Schema changes result from monitoring |
| [SourceCredentials](interfaces/SourceCredentials.md) | Data source credentials (encrypted in production) |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [AlertDestinationType](type-aliases/AlertDestinationType.md) | - |
| [CheckStatus](type-aliases/CheckStatus.md) | - |
| [Database](type-aliases/Database.md) | Type-safe database instance |
| [DataSourceType](type-aliases/DataSourceType.md) | - |
| [RuleType](type-aliases/RuleType.md) | - |

## Variables

| Variable | Description |
| ------ | ------ |
| [createError](variables/createError.md) | Create standardized error instances |

## Functions

| Function | Description |
| ------ | ------ |
| [checkFreshness](functions/checkFreshness.md) | Check data freshness for a given rule with security validation. |
| [checkSchemaChanges](functions/checkSchemaChanges.md) | Detect schema changes by comparing the current table schema against a stored baseline. Returns `'alert'` when columns are added, removed, or modified. |
| [checkVolumeAnomaly](functions/checkVolumeAnomaly.md) | Check for volume anomalies by comparing the current row count against a historical baseline. Returns `'alert'` when the deviation exceeds the configured threshold, or `'pending'` while the baseline is being built. |
| [createDatabase](functions/createDatabase.md) | Create a Drizzle ORM database connection to a PostgreSQL instance. |
| [createMetadataStorage](functions/createMetadataStorage.md) | Create and initialize a metadata storage instance. |
