---
sidebar_position: 7
---

# CLI

FreshGuard Core includes a command-line interface for self-hosters.

## Setup

```bash
# Set your database connection
export FRESHGUARD_DATABASE_URL="postgresql://user:password@localhost:5432/db?sslmode=require"
```

## Commands

### Initialize configuration

```bash
pnpm exec freshguard init
```

Creates a default configuration file for your monitoring setup.

### Test connection

```bash
pnpm exec freshguard test
```

Verifies that the database connection works and FreshGuard can query your tables.

### Run monitoring

```bash
pnpm exec freshguard run
```

Executes all active monitoring rules and reports results.

## Environment variables

| Variable | Description |
|---|---|
| `FRESHGUARD_DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | Set to `production` for production deployments |
| `LOG_LEVEL` | Logging verbosity: `debug`, `info`, `warn`, `error` |

## Using with npx

If installed globally or via npx:

```bash
npx @freshguard/freshguard-core init
npx @freshguard/freshguard-core test
npx @freshguard/freshguard-core run
```
