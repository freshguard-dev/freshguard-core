---
sidebar_position: 8
---

# Self-Hosting

Run FreshGuard Core on your own infrastructure. No external dependencies, no vendor lock-in.

## What you get

- Core monitoring (freshness, volume anomaly, schema changes)
- Six database connectors (PostgreSQL, DuckDB, BigQuery, Snowflake, MySQL, Redshift)
- CLI tool for operations
- Structured JSON logging
- Full source code (MIT license)

## What's not included

- Multi-tenant dashboard (use the API programmatically or via config files)
- Managed uptime (your infrastructure, your responsibility)

## Deployment options

### Node.js application

```bash
pnpm add @freshguard/freshguard-core
```

Build your monitoring script, schedule with cron or systemd.

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod
COPY . .
RUN pnpm build

ENV NODE_ENV=production
USER node
CMD ["node", "dist/monitor.js"]
```

### Docker Compose

```yaml
services:
  monitor:
    build: .
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: myapp
      DB_USER: freshguard_readonly
      DB_PASSWORD_FILE: /run/secrets/db_password
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Database user setup

Create a dedicated read-only user:

```sql
-- PostgreSQL
CREATE ROLE freshguard_readonly;
GRANT CONNECT ON DATABASE myapp TO freshguard_readonly;
GRANT USAGE ON SCHEMA public TO freshguard_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO freshguard_readonly;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public FROM freshguard_readonly;

CREATE USER freshguard_monitor WITH PASSWORD 'secure_random_password';
GRANT freshguard_readonly TO freshguard_monitor;
```

## Security checklist

- [ ] Use environment variables for all credentials
- [ ] Enable SSL for database connections (`ssl: true`)
- [ ] Use a dedicated read-only database user
- [ ] Set `NODE_ENV=production`
- [ ] Run containers as non-root
- [ ] Keep dependencies updated
- [ ] Don't expose database ports to the internet

For the full security guide, see [Security Overview](/docs/security/overview).

## Monitoring your monitor

Add a health check endpoint or log watcher to ensure FreshGuard itself is running:

```typescript
async function healthCheck() {
  try {
    await connector.testConnection();
    console.log('Database connection healthy');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}
```

## Custom alerting

FreshGuard Core doesn't include notification delivery. Build your own:

```typescript
const result = await checkFreshness(connector, rule);

if (result.status === 'alert') {
  // Slack
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `Data stale: ${result.lagMinutes}m lag` }),
  });

  // PagerDuty, email, custom webhook, etc.
}
```
