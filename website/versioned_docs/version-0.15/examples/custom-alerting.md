---
sidebar_position: 5
---

# Custom Alerting

FreshGuard Core returns check results — you build the notification layer. Here are patterns for common alert destinations.

## Slack webhook

```typescript
import { checkFreshness, PostgresConnector } from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const result = await checkFreshness(connector, rule);

if (result.status === 'alert') {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `*${rule.name}*: Data is ${result.lagMinutes}m stale (tolerance: ${rule.toleranceMinutes}m)`,
    }),
  });
}
```

## Generic webhook

```typescript
if (result.status === 'alert') {
  await fetch(process.env.ALERT_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}`,
    },
    body: JSON.stringify({
      rule_id: rule.id,
      rule_name: rule.name,
      status: result.status,
      lag_minutes: result.lagMinutes,
      row_count: result.rowCount,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

## Scheduled monitoring with alerts

```typescript
import cron from 'node-cron';
import {
  checkFreshness,
  checkVolumeAnomaly,
  checkSchemaChanges,
  createMetadataStorage,
  PostgresConnector,
  ConnectionError,
  TimeoutError,
} from '@freshguard/freshguard-core';

const connector = new PostgresConnector({
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  ssl: true,
});

const metadataStorage = await createMetadataStorage();

async function sendAlert(message: string) {
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
  }
}

// Every 5 minutes: freshness + volume
cron.schedule('*/5 * * * *', async () => {
  try {
    const freshness = await checkFreshness(connector, freshnessRule, metadataStorage);
    if (freshness.status === 'alert') {
      await sendAlert(`Freshness alert: ${freshnessRule.name} — ${freshness.lagMinutes}m lag`);
    }

    const volume = await checkVolumeAnomaly(connector, volumeRule, metadataStorage);
    if (volume.status === 'alert') {
      await sendAlert(`Volume alert: ${volumeRule.name} — ${volume.deviation}% deviation`);
    }
  } catch (error) {
    if (error instanceof ConnectionError) {
      await sendAlert(`Connection failed: ${error.message}`);
    } else if (error instanceof TimeoutError) {
      await sendAlert(`Query timeout: ${error.message}`);
    }
  }
});

// Every hour: schema changes
cron.schedule('0 * * * *', async () => {
  try {
    const schema = await checkSchemaChanges(connector, schemaRule, metadataStorage);
    if (schema.status === 'alert') {
      await sendAlert(`Schema change: ${schemaRule.name} — ${schema.schemaChanges?.summary}`);
    }
  } catch (error) {
    await sendAlert(`Schema check failed: ${(error as Error).message}`);
  }
});
```
