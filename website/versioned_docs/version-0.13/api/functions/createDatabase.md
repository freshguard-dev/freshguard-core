# Function: createDatabase()

> **createDatabase**(`connectionString`): `PostgresJsDatabase`\<`Record`\<`string`, `unknown`\>\> & `object`

Defined in: [src/db/index.ts:17](https://github.com/freshguard-dev/freshguard-core/blob/0f06ee7d1e37deed839d08ac5735856e04c99efa/src/db/index.ts#L17)

Create a database connection

## Parameters

### connectionString

`string`

PostgreSQL connection string

## Returns

`PostgresJsDatabase`\<`Record`\<`string`, `unknown`\>\> & `object`

Drizzle database instance
