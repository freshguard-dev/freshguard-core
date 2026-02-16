---
sidebar_position: 5
---

# Metadata Storage

Metadata storage persists execution history and schema baselines. It's required for volume anomaly detection and schema change monitoring, and optional for freshness checks.

## Quick start (zero setup)

```typescript
import { createMetadataStorage } from '@freshguard/freshguard-core';

// Creates ./freshguard-metadata.db using embedded DuckDB
const storage = await createMetadataStorage();

// Use with monitoring functions
const result = await checkVolumeAnomaly(connector, rule, storage);

// Clean up when done
await storage.close();
```

## DuckDB storage

Best for: development, single-server deployments, Docker containers.

```typescript
// Default path
const storage = await createMetadataStorage();

// Custom path
const storage = await createMetadataStorage({
  type: 'duckdb',
  path: '/app/data/freshguard-metadata.db',
});

// In-memory (for testing)
const storage = await createMetadataStorage({
  type: 'duckdb',
  path: ':memory:',
});
```

## PostgreSQL storage

Best for: production, multi-server environments, existing PostgreSQL infrastructure.

```sql
-- Create a dedicated metadata database
CREATE DATABASE freshguard_metadata;
CREATE USER freshguard_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE freshguard_metadata TO freshguard_user;
```

```typescript
const storage = await createMetadataStorage({
  type: 'postgresql',
  url: 'postgresql://freshguard_user:secure_password@localhost:5432/freshguard_metadata',
});
```

## What's stored

| Table | Purpose |
|---|---|
| `check_executions` | Row counts, lag times, deviation values for each check run |
| `monitoring_rules` | Rule definitions |
| `schema_baselines` | Schema snapshots for change detection |

## Environment-based configuration

```typescript
const storage = await createMetadataStorage({
  type: (process.env.METADATA_STORAGE_TYPE as 'duckdb' | 'postgresql') || 'duckdb',
  url: process.env.METADATA_DATABASE_URL,
  path: process.env.METADATA_DB_PATH,
});
```

## Best practices

- **Development:** Use DuckDB (default) — zero setup, single file
- **Production:** Use PostgreSQL — ACID, concurrent access, backups
- **Testing:** Use `:memory:` DuckDB — no cleanup needed
- **Docker:** Mount the DuckDB file to a volume for persistence
- Add `*.db` to `.gitignore` to avoid committing metadata files
- Call `storage.close()` on shutdown for clean resource release

## Troubleshooting

**DuckDB lock errors:** Ensure only one process accesses the file. Add shutdown handlers:

```typescript
process.on('SIGTERM', async () => {
  await storage.close();
  process.exit(0);
});
```

**PostgreSQL connection errors:** Add a connection timeout:

```typescript
const storage = await createMetadataStorage({
  type: 'postgresql',
  url: 'postgresql://user:pass@host:5432/db?connect_timeout=10',
});
```
