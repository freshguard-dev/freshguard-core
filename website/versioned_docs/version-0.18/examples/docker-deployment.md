---
sidebar_position: 6
---

# Docker Deployment

A production-ready Docker setup for running FreshGuard Core.

## Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
USER node
CMD ["node", "dist/monitor.js"]
```

## Docker Compose

```yaml
services:
  freshguard:
    build: .
    environment:
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_NAME: myapp
      DB_USER: freshguard_readonly
      DB_PASSWORD: ${DB_PASSWORD}
      METADATA_STORAGE_TYPE: duckdb
      NODE_ENV: production
    volumes:
      - metadata:/app/data
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  metadata:
```

## Monitoring script

Create `src/monitor.ts`:

```typescript
import {
  checkFreshness,
  checkVolumeAnomaly,
  createMetadataStorage,
  PostgresConnector,
} from '@freshguard/freshguard-core';
import type { MonitoringRule } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: process.env.NODE_ENV === 'production',
});

const metadataStorage = await createMetadataStorage({
  type: 'duckdb',
  path: '/app/data/freshguard-metadata.db',
});

const rules: MonitoringRule[] = [
  {
    id: 'orders-freshness',
    sourceId: 'main',
    name: 'Orders Freshness',
    tableName: 'orders',
    ruleType: 'freshness',
    toleranceMinutes: 60,
    timestampColumn: 'updated_at',
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function runChecks() {
  for (const rule of rules) {
    const result = await checkFreshness(connector, rule, metadataStorage);
    console.log(JSON.stringify({ rule: rule.id, status: result.status, lag: result.lagMinutes }));
  }
}

// Run every 5 minutes
setInterval(runChecks, 5 * 60 * 1000);

// Initial run
await runChecks();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await metadataStorage.close();
  await connector.close();
  process.exit(0);
});
```

## Running

```bash
# Start
docker compose up -d

# Check logs
docker compose logs -f freshguard

# Stop
docker compose down
```
