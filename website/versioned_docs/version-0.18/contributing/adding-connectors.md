---
sidebar_position: 2
---

# Adding a Database Connector

How to add support for a new database.

## 1. Create the connector file

Create `src/connectors/mydb.ts`:

```typescript
import { BaseConnector } from './base-connector.js';
import type { Connector, TableSchema, QueryResultRow } from '../types/connector.js';

export class MyDBConnector extends BaseConnector {
  constructor(config: ConnectionConfig) {
    super(config);
  }

  async testConnection(): Promise<boolean> {
    // Verify the connection works
  }

  async listTables(): Promise<string[]> {
    // Return all table names
  }

  async getTableSchema(tableName: string): Promise<TableSchema> {
    // Return column definitions for the table
  }

  async getRowCount(tableName: string): Promise<number> {
    // Return COUNT(*) for the table
  }

  async getMaxTimestamp(tableName: string, columnName: string): Promise<Date | null> {
    // Return MAX(columnName) from the table
  }

  async getMinTimestamp(tableName: string, columnName: string): Promise<Date | null> {
    // Return MIN(columnName) from the table
  }

  async executeQuery(sql: string): Promise<QueryResultRow[]> {
    // Execute a validated SQL query and return results
  }

  async close(): Promise<void> {
    // Release connections and clean up
  }
}
```

`BaseConnector` provides query validation, timeout protection, error sanitization, and logging automatically.

## 2. Export the connector

Add to `src/connectors/index.ts`:

```typescript
export { MyDBConnector } from './mydb.js';
```

Add to `src/index.ts`:

```typescript
export { MyDBConnector } from './connectors/index.js';
```

## 3. Add tests

Create `tests/connectors/mydb.test.ts` with:

- Connection test
- `listTables` test
- `getTableSchema` test
- `getRowCount` test
- `getMaxTimestamp` / `getMinTimestamp` tests
- Error handling tests (invalid credentials, network errors)
- SQL injection prevention tests

## 4. Add integration tests

If possible, add the database to `docker-compose.test.yml` and create integration tests that run against a real instance.

## 5. Add the dependency

```bash
pnpm add mydb-driver
```

Ensure the dependency uses an OSI-approved open-source license (MIT, Apache 2.0, BSD).

## 6. Document

- Add a section to the [Connectors guide](/docs/guides/connectors)
- Add a usage example to the [Examples section](/docs/examples/multi-database)
