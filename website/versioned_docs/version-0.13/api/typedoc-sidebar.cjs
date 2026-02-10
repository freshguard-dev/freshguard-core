// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "Namespaces",
      items: [
        {
          type: "category",
          label: "schema",
          items: [
            {
              type: "category",
              label: "Variables",
              items: [
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/alertDestinations",
                  label: "alertDestinations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/alertLog",
                  label: "alertLog"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/auditLog",
                  label: "auditLog"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/checkExecutions",
                  label: "checkExecutions"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/checkExecutionsRelations",
                  label: "checkExecutionsRelations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/dataSources",
                  label: "dataSources"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/dataSourcesRelations",
                  label: "dataSourcesRelations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/monitoringRules",
                  label: "monitoringRules"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/monitoringRulesRelations",
                  label: "monitoringRulesRelations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/schemaBaselines",
                  label: "schemaBaselines"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/schemaBaselinesRelations",
                  label: "schemaBaselinesRelations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/schemaMigrations",
                  label: "schemaMigrations"
                },
                {
                  type: "doc",
                  id: "api/@freshguard/namespaces/schema/variables/systemConfig",
                  label: "systemConfig"
                }
              ]
            }
          ],
          link: {
            type: "doc",
            id: "api/@freshguard/namespaces/schema/index"
          }
        }
      ]
    },
    {
      type: "category",
      label: "Classes",
      items: [
        {
          type: "doc",
          id: "api/classes/BigQueryConnector",
          label: "BigQueryConnector"
        },
        {
          type: "doc",
          id: "api/classes/ConfigurationError",
          label: "ConfigurationError"
        },
        {
          type: "doc",
          id: "api/classes/ConnectionError",
          label: "ConnectionError"
        },
        {
          type: "doc",
          id: "api/classes/DuckDBConnector",
          label: "DuckDBConnector"
        },
        {
          type: "doc",
          id: "api/classes/DuckDBMetadataStorage",
          label: "DuckDBMetadataStorage"
        },
        {
          type: "doc",
          id: "api/classes/ErrorHandler",
          label: "ErrorHandler"
        },
        {
          type: "doc",
          id: "api/classes/FreshGuardError",
          label: "FreshGuardError"
        },
        {
          type: "doc",
          id: "api/classes/MonitoringError",
          label: "MonitoringError"
        },
        {
          type: "doc",
          id: "api/classes/MySQLConnector",
          label: "MySQLConnector"
        },
        {
          type: "doc",
          id: "api/classes/PostgresConnector",
          label: "PostgresConnector"
        },
        {
          type: "doc",
          id: "api/classes/PostgreSQLMetadataStorage",
          label: "PostgreSQLMetadataStorage"
        },
        {
          type: "doc",
          id: "api/classes/QueryError",
          label: "QueryError"
        },
        {
          type: "doc",
          id: "api/classes/RedshiftConnector",
          label: "RedshiftConnector"
        },
        {
          type: "doc",
          id: "api/classes/SecurityError",
          label: "SecurityError"
        },
        {
          type: "doc",
          id: "api/classes/SnowflakeConnector",
          label: "SnowflakeConnector"
        },
        {
          type: "doc",
          id: "api/classes/TimeoutError",
          label: "TimeoutError"
        }
      ]
    },
    {
      type: "category",
      label: "Interfaces",
      items: [
        {
          type: "doc",
          id: "api/interfaces/AlertDestination",
          label: "AlertDestination"
        },
        {
          type: "doc",
          id: "api/interfaces/CheckExecution",
          label: "CheckExecution"
        },
        {
          type: "doc",
          id: "api/interfaces/CheckResult",
          label: "CheckResult"
        },
        {
          type: "doc",
          id: "api/interfaces/ColumnChange",
          label: "ColumnChange"
        },
        {
          type: "doc",
          id: "api/interfaces/DataSource",
          label: "DataSource"
        },
        {
          type: "doc",
          id: "api/interfaces/FreshGuardConfig",
          label: "FreshGuardConfig"
        },
        {
          type: "doc",
          id: "api/interfaces/MetadataStorage",
          label: "MetadataStorage"
        },
        {
          type: "doc",
          id: "api/interfaces/MetadataStorageConfig",
          label: "MetadataStorageConfig"
        },
        {
          type: "doc",
          id: "api/interfaces/MonitoringRule",
          label: "MonitoringRule"
        },
        {
          type: "doc",
          id: "api/interfaces/SchemaBaseline",
          label: "SchemaBaseline"
        },
        {
          type: "doc",
          id: "api/interfaces/SchemaChanges",
          label: "SchemaChanges"
        },
        {
          type: "doc",
          id: "api/interfaces/SourceCredentials",
          label: "SourceCredentials"
        }
      ]
    },
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "api/type-aliases/AlertDestinationType",
          label: "AlertDestinationType"
        },
        {
          type: "doc",
          id: "api/type-aliases/CheckStatus",
          label: "CheckStatus"
        },
        {
          type: "doc",
          id: "api/type-aliases/Database",
          label: "Database"
        },
        {
          type: "doc",
          id: "api/type-aliases/DataSourceType",
          label: "DataSourceType"
        },
        {
          type: "doc",
          id: "api/type-aliases/RuleType",
          label: "RuleType"
        }
      ]
    },
    {
      type: "category",
      label: "Variables",
      items: [
        {
          type: "doc",
          id: "api/variables/createError",
          label: "createError"
        }
      ]
    },
    {
      type: "category",
      label: "Functions",
      items: [
        {
          type: "doc",
          id: "api/functions/checkFreshness",
          label: "checkFreshness"
        },
        {
          type: "doc",
          id: "api/functions/checkSchemaChanges",
          label: "checkSchemaChanges"
        },
        {
          type: "doc",
          id: "api/functions/checkVolumeAnomaly",
          label: "checkVolumeAnomaly"
        },
        {
          type: "doc",
          id: "api/functions/createDatabase",
          label: "createDatabase"
        },
        {
          type: "doc",
          id: "api/functions/createMetadataStorage",
          label: "createMetadataStorage"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;