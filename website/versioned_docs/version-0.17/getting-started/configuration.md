---
sidebar_position: 3
---

# Configuration

## Environment variables

Store all sensitive configuration in environment variables:

```bash
# Database connection
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=freshguard_readonly
DB_PASSWORD=secure-random-password

# Application
NODE_ENV=production
LOG_LEVEL=info

# Metadata storage (optional)
METADATA_STORAGE_TYPE=duckdb
METADATA_DATABASE_URL=postgresql://user:pass@host:5432/freshguard_metadata
```

See `.env.example` in the repository for the full list with security guidelines.

## Connector configuration

All connectors accept a configuration object. Common options:

```typescript
const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,                    // Enable SSL (recommended for production)
  timeout: 30000,               // Connection timeout in ms
  queryTimeout: 10000,          // Query timeout in ms
});
```

For connector-specific options, see the [Connectors guide](/docs/guides/connectors).

## Monitoring rule fields

Every `MonitoringRule` requires:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique rule identifier |
| `sourceId` | `string` | Identifier for the data source |
| `name` | `string` | Human-readable rule name |
| `tableName` | `string` | Target table to monitor |
| `ruleType` | `'freshness' \| 'volume_anomaly' \| 'schema_change'` | Type of check |
| `checkIntervalMinutes` | `number` | How often to run the check |
| `isActive` | `boolean` | Whether the rule is enabled |
| `createdAt` | `Date` | Rule creation timestamp |
| `updatedAt` | `Date` | Rule last-updated timestamp |

### Freshness-specific fields

| Field | Type | Description |
|---|---|---|
| `toleranceMinutes` | `number` | Maximum acceptable data lag |
| `timestampColumn` | `string` | Column to check for freshness |

### Schema-change-specific fields

| Field | Type | Description |
|---|---|---|
| `schemaChangeConfig.adaptationMode` | `'auto' \| 'manual' \| 'alert_only'` | How to handle detected changes |
| `schemaChangeConfig.monitoringMode` | `'full' \| 'partial'` | Monitor all or selected columns |
| `schemaChangeConfig.trackedColumns.alertLevel` | `'low' \| 'medium' \| 'high'` | Alert severity |
| `schemaChangeConfig.trackedColumns.trackTypes` | `boolean` | Track data type changes |
| `schemaChangeConfig.trackedColumns.trackNullability` | `boolean` | Track nullability changes |
| `schemaChangeConfig.baselineRefreshDays` | `number` | Auto-refresh baseline interval |

## Metadata storage configuration

```typescript
// DuckDB (zero-setup, default)
const storage = await createMetadataStorage();
const storage = await createMetadataStorage({ type: 'duckdb', path: './my-data.db' });

// PostgreSQL (production)
const storage = await createMetadataStorage({
  type: 'postgresql',
  url: process.env.METADATA_DATABASE_URL,
});
```

See the [Metadata Storage guide](/docs/guides/metadata-storage) for details.
