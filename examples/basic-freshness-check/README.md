# FreshGuard Core - Basic Freshness Monitoring Example

This example demonstrates how to use **FreshGuard Core** for data pipeline freshness monitoring and volume anomaly detection in a self-hosted environment.

## What This Example Shows

✅ **PostgreSQL Integration** - Connect to and monitor PostgreSQL databases
✅ **Freshness Monitoring** - Detect when data becomes stale
✅ **Volume Anomaly Detection** - Identify unexpected changes in data volume
✅ **Alert Handling** - Process and respond to monitoring alerts
✅ **Production Patterns** - Structured code ready for production use

## Prerequisites

- **Node.js20+** (Check with `node --version`)
- **Docker & Docker Compose** (for PostgreSQL database)
- **pnpm** (recommended) or npm

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# If you're working with the FreshGuard repo
cd examples/basic-freshness-check

# Install dependencies
pnpm install
# or: npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# The defaults work with the included Docker setup
# Edit .env if you want to use a different database
```

### 3. Start Database

```bash
# Start PostgreSQL with sample data
docker-compose up -d

# Wait for database to be ready (about 10-15 seconds)
docker-compose logs -f postgres
# Look for: "database system is ready to accept connections"
```

### 4. Setup Monitoring

```bash
# Test connection and verify sample data
pnpm run setup
```

Expected output:
```
🚀 Setting up FreshGuard monitoring example...

📡 Connecting to PostgreSQL...
✅ Database connection established

🔍 Testing database connection...
   Database time: 2024-01-15T10:30:45.123Z
   PostgreSQL version: PostgreSQL 16.1
✅ Database connection test passed

📊 Checking sample data...
   Orders table: 6 rows
   User events table: 1050 rows
   Latest order updated: 10 minutes ago
✅ Sample data verified
```

### 5. Run Monitoring

```bash
# Execute monitoring checks
pnpm run monitor
```

Expected output:
```
🔍 FreshGuard Monitoring Example

📊 Monitoring 2 rules...
🕐 Started at: 2024-01-15T10:30:45.123Z

🔎 Checking: Orders Freshness Check
   Table: orders
   Type: freshness
   Status: ✅ OK
   Data lag: 10 minutes
   Tolerance: 60 minutes
   Last update: 1/15/2024, 10:20:45 AM

🔎 Checking: User Events Volume Check
   Table: user_events
   Type: volume
   Status: ✅ OK
   Current count: 50
   Expected count: 45
   Deviation: 11%
```

## Understanding the Example

### Database Schema

The example creates two monitoring targets:

```sql
-- Orders table - for freshness monitoring
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- ← Monitored
);

-- User events table - for volume monitoring
CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- ← Monitored
);
```

### Monitoring Rules

**Rule 1: Orders Freshness**
- **Purpose**: Detect when order updates stop flowing
- **Logic**: Alert if no orders updated in last 60 minutes
- **Use Case**: Critical business process monitoring

**Rule 2: User Events Volume**
- **Purpose**: Detect unusual spikes or drops in user activity
- **Logic**: Compare recent volume to historical baseline
- **Use Case**: Traffic anomaly detection

### File Structure

```
basic-freshness-check/
├── README.md              # This file
├── package.json           # Dependencies and scripts
├── docker-compose.yml     # PostgreSQL setup
├── init.sql              # Sample database schema/data
├── .env.example          # Configuration template
├── setup.ts              # Database connection verification
└── monitor.ts            # Main monitoring logic
```

## Detailed Usage

### Understanding the Code

**setup.ts** - Verifies everything works:
```typescript
import { createDatabase } from '@thias-se/freshguard-core';

const db = createDatabase(DATABASE_URL);
// Test connection, verify sample data exists
```

**monitor.ts** - Runs monitoring checks:
```typescript
import { checkFreshness, checkVolumeAnomaly } from '@thias-se/freshguard-core';

// Define monitoring rules
const rule: MonitoringRule = {
  tableName: 'orders',
  ruleType: 'freshness',
  toleranceMinutes: 60,
  timestampColumn: 'updated_at',
  // ...
};

// Execute check
const result = await checkFreshness(db, rule);
```

### Customizing Monitoring Rules

Edit the `MONITORING_RULES` array in `monitor.ts`:

```typescript
const MONITORING_RULES: MonitoringRule[] = [
  {
    id: 'orders-freshness',
    tableName: 'orders',
    ruleType: 'freshness',
    toleranceMinutes: 30,        // ← Reduce for more sensitive alerts
    timestampColumn: 'updated_at',
    // ...
  }
];
```

**Common modifications:**
- **toleranceMinutes**: How long before data is considered stale
- **timestampColumn**: Which column contains the timestamp to monitor
- **tableName**: Which table to monitor

### Triggering Alerts

To see alerts in action:

**Option 1: Adjust tolerance**
```typescript
toleranceMinutes: 5,  // Very sensitive - alerts quickly
```

**Option 2: Modify sample data**
```sql
-- Connect to database
docker exec -it freshguard-example-db psql -U freshguard_user -d freshguard_example

-- Make all orders old
UPDATE orders SET updated_at = NOW() - INTERVAL '2 hours';

-- Run monitoring again
\q
pnpm run monitor
```

**Option 3: Stop data flow simulation**
```sql
-- In production, this would be pipeline failure
-- Here we just make timestamps old
UPDATE orders SET updated_at = '2024-01-01 00:00:00';
```

### Production Integration

**Scheduling with cron:**
```typescript
import cron from 'node-cron';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const results = await runMonitoring();
  await handleAlerts(results);
});
```

**Adding real alerts:**
```typescript
if (result.status === 'alert') {
  // Send to Slack
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 ${rule.name}: ${result.message}`
    })
  });

  // Send email
  await sendEmail({
    to: 'team@company.com',
    subject: `Data Alert: ${rule.name}`,
    body: result.message
  });
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker exec -it freshguard-example-db psql -U freshguard_user -d freshguard_example -c "SELECT NOW();"
```

### Common Error Messages

**"connection refused"**
- PostgreSQL not started: `docker-compose up -d`
- Wrong port/host in DATABASE_URL

**"database does not exist"**
- Database creation failed: Check docker-compose logs
- Wrong database name in connection string

**"Sample data not found"**
- init.sql didn't run: Recreate containers with `docker-compose down -v && docker-compose up -d`

**"Module not found"**
- Dependencies not installed: `pnpm install`
- FreshGuard Core not built: Check main package

### Performance Considerations

**For large tables:**
- Add indexes on timestamp columns: `CREATE INDEX idx_orders_updated_at ON orders(updated_at);`
- Use table partitioning for historical data
- Consider sampling for volume checks

**For high frequency:**
- Use connection pooling
- Cache baseline calculations
- Implement proper error handling and retries

## Next Steps

### Extending This Example

1. **Add More Rules**: Monitor additional tables and metrics
2. **Custom Alerts**: Integrate with your notification systems
3. **Dashboard**: Build a simple web UI to view results
4. **Historical Tracking**: Store check results for trend analysis

### Production Deployment

1. **Environment Management**: Use proper secrets management
2. **Error Handling**: Add comprehensive logging and error recovery
3. **Monitoring the Monitor**: Health checks for the monitoring system itself
4. **Scaling**: Consider multiple instances for high availability

### Other Database Types

FreshGuard Core supports multiple databases:
- **DuckDB**: For analytical workloads
- **More coming**: MySQL, BigQuery, Snowflake

See the main FreshGuard documentation for connector examples.

## Learn More

- **FreshGuard Core Documentation**: [Main README](../../README.md)
- **API Reference**: [TypeScript definitions](../../src/types.ts)
- **Self-Hosting Guide**: [docs/SELF_HOSTING.md](../../docs/SELF_HOSTING.md)
- **Contributing**: [docs/CONTRIBUTING.md](../../docs/CONTRIBUTING.md)

## Support

- **Issues**: [GitHub Issues](https://github.com/freshguard/freshguard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/freshguard/freshguard/discussions)

---

**🎉 You now have a working data freshness monitoring system!**

Try modifying the rules, adding new tables to monitor, or integrating with your existing alerting infrastructure.