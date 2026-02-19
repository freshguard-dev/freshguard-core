# Function: createDatabase()

> **createDatabase**(`connectionString`): `PostgresJsDatabase`\<`Record`\<`string`, `unknown`\>\> & `object`

Defined in: [src/db/index.ts:30](https://github.com/freshguard-dev/freshguard-core/blob/743e0d7f766ffa7f319356f10d91580adc870698/src/db/index.ts#L30)

Create a Drizzle ORM database connection to a PostgreSQL instance.

## Parameters

### connectionString

`string`

PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`)

## Returns

`PostgresJsDatabase`\<`Record`\<`string`, `unknown`\>\> & `object`

Drizzle database instance with the FreshGuard schema loaded

## Example

```typescript
import { createDatabase } from '@freshguard/freshguard-core';

const db = createDatabase(process.env.DATABASE_URL!);
```
