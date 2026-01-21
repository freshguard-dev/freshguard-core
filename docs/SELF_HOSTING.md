# Self-Hosting FreshGuard

FreshGuard Core is open source (MIT) and can be self-hosted for free.

## What You Get (Free, Self-Hosted)

✅ **Core monitoring engine** - Freshness + Volume checks
✅ **PostgreSQL support** - Native PostgreSQL connector
✅ **DuckDB support** - Coming soon
✅ **Slack/Email/PagerDuty alerting** - Via custom integrations
✅ **Full control** - Your data stays on your infrastructure
✅ **Docker & Kubernetes ready** - Easy deployment

## What's Not Included

❌ **Multi-user dashboard** - You get programmatic API or config files
❌ **99.9% SLA** - Your uptime = your responsibility
❌ **Priority support** - Community support via GitHub
❌ **Advanced features** - Data lineage, ML anomalies (cloud-only)

## Quick Start

### Option 1: Programmatic API

```bash
pnpm install @thias-se/freshguard-core
```

```typescript
import { checkFreshness, createDatabase } from '@thias-se/freshguard-core';

const db = createDatabase('postgresql://user:pass@localhost:5432/mydb');

const rule = {
  id: 'orders-freshness',
  workspaceId: 'self-hosted',
  sourceId: 'prod_db',
  name: 'Orders Freshness',
  tableName: 'orders',
  ruleType: 'freshness' as const,
  toleranceMinutes: 60,
  timestampColumn: 'updated_at',
  checkIntervalMinutes: 5,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const result = await checkFreshness(db, rule);
if (result.status === 'alert') {
  console.log(`⚠️ Data is stale! Lag: ${result.lagMinutes}m`);
}
```

### Option 2: Docker Deployment

**Coming soon!** We're working on a Docker image for easy deployment.

For now, you can containerize your own implementation:

```dockerfile
FROM node20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy your monitoring script
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY monitor.ts ./

CMD ["pnpm", "exec", "tsx", "monitor.ts"]
```

### Option 3: Kubernetes Deployment

**Coming soon!** We're working on Helm charts.

## Configuration

Self-hosters can configure monitoring via:

### 1. YAML Configuration (Recommended)

Create `freshguard.yaml`:

```yaml
database:
  url: postgresql://user:pass@localhost:5432/mydb

sources:
  prod_db:
    type: postgres
    host: localhost
    port: 5432
    database: production
    username: monitoring_user
    password: ${DB_PASSWORD}  # Use env vars for secrets

rules:
  - id: orders_freshness
    sourceId: prod_db
    table: orders
    type: freshness
    frequency: 5  # Check every 5 minutes
    tolerance: 60  # Alert if > 60 minutes stale
    timestampColumn: updated_at
    alerts:
      - type: slack
        address: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

  - id: events_volume
    sourceId: prod_db
    table: events
    type: volume_anomaly
    frequency: 15
    deviationThreshold: 20  # Alert if ±20% from baseline
    alerts:
      - type: email
        address: data-team@company.com
```

### 2. Programmatic Configuration

```typescript
import { checkFreshness, createDatabase } from '@thias-se/freshguard-core';
import cron from 'node-cron';

const db = createDatabase(process.env.DATABASE_URL!);

const rules = [
  {
    id: 'orders-freshness',
    tableName: 'orders',
    ruleType: 'freshness' as const,
    toleranceMinutes: 60,
    // ... other rule config
  },
  // Add more rules...
];

// Schedule checks
cron.schedule('*/5 * * * *', async () => {
  for (const rule of rules) {
    const result = await checkFreshness(db, rule);

    if (result.status === 'alert') {
      await sendAlert(rule, result);
    }
  }
});
```

## Custom Alerting

FreshGuard Core doesn't include alerting out of the box. You integrate with your own systems:

### Slack

```typescript
async function sendSlackAlert(rule: MonitoringRule, result: CheckResult) {
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `⚠️ *${rule.name}* is stale`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Table', value: rule.tableName, short: true },
          { title: 'Lag', value: `${result.lagMinutes}m`, short: true },
          { title: 'Threshold', value: `${rule.toleranceMinutes}m`, short: true },
        ],
      }],
    }),
  });
}
```

### PagerDuty

```typescript
async function sendPagerDutyAlert(rule: MonitoringRule, result: CheckResult) {
  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: process.env.PAGERDUTY_KEY,
      event_action: 'trigger',
      payload: {
        summary: `Data freshness alert: ${rule.name}`,
        severity: 'error',
        source: 'freshguard',
        custom_details: {
          table: rule.tableName,
          lag_minutes: result.lagMinutes,
          threshold: rule.toleranceMinutes,
        },
      },
    }),
  });
}
```

### Email

```typescript
import nodemailer from 'nodemailer';

async function sendEmailAlert(rule: MonitoringRule, result: CheckResult) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: 'alerts@yourcompany.com',
    to: 'data-team@yourcompany.com',
    subject: `[FreshGuard Alert] ${rule.name}`,
    html: `
      <h2>⚠️ Data Freshness Alert</h2>
      <p><strong>${rule.name}</strong> is stale.</p>
      <ul>
        <li><strong>Table:</strong> ${rule.tableName}</li>
        <li><strong>Lag:</strong> ${result.lagMinutes} minutes</li>
        <li><strong>Threshold:</strong> ${rule.toleranceMinutes} minutes</li>
        <li><strong>Last Update:</strong> ${result.lastUpdate}</li>
      </ul>
    `,
  });
}
```

## Database Setup

FreshGuard Core stores execution history in your monitoring database:

```sql
-- Run migrations
pnpm install drizzle-orm drizzle-kit
pnpm exec drizzle-kit push
```

Or manually create tables:

```sql
-- See packages/core/src/db/schema.ts for full schema
CREATE TABLE check_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL,
  source_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  row_count BIGINT,
  last_update TIMESTAMP,
  lag_minutes INTEGER,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

## Scaling

### Single Instance

For <100 rules, a single Node.js process is sufficient:

```bash
node monitor.js
```

### Multiple Instances

For >100 rules, use multiple processes with sharding:

```typescript
// Instance 1: Check rules 0-99
const myRules = allRules.slice(0, 100);

// Instance 2: Check rules 100-199
const myRules = allRules.slice(100, 200);
```

### High Availability

Use a process manager like PM2:

```bash
pnpm install -g pm2
pm2 start monitor.js --instances 2 --name freshguard
pm2 save
pm2 startup
```

## Monitoring FreshGuard Itself

**Who monitors the monitor?**

Use a simple health check endpoint:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', lastCheck: lastCheckTime });
});

app.listen(3000);
```

Then monitor with:
- **Uptime Robot** (free)
- **Pingdom**
- **Better Uptime**

## Troubleshooting

### "Connection timeout"

Increase timeout in connector:

```typescript
const client = postgres(connectionString, {
  connect_timeout: 30, // 30 seconds
});
```

### "Too many connections"

Use connection pooling:

```typescript
const client = postgres(connectionString, {
  max: 10, // Max 10 concurrent connections
});
```

### "Out of memory"

Reduce historical data window:

```typescript
const rule = {
  baselineWindowDays: 7, // Reduce from 30 to 7 days
  // ...
};
```

## Want Managed Hosting?

If self-hosting becomes too much:

**[Try FreshGuard Cloud](https://freshguard.dev)**

- Multi-user dashboard
- 99.9% SLA
- Managed infrastructure
- Priority support
- $99-499/month

You can migrate your rules with one command (coming soon).

## Support

- **GitHub Issues:** [Report bugs](https://github.com/freshguard/freshguard/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/freshguard/freshguard/discussions)
- **Discord:** Coming soon

---

Happy self-hosting! 🚀
