#!/usr/bin/env tsx

/**
 * FreshGuard Basic Example - Monitoring Script
 *
 * This script demonstrates how to:
 * 1. Set up monitoring rules for freshness and volume checks
 * 2. Execute monitoring checks
 * 3. Handle alerts and notifications
 * 4. Display results in a user-friendly format
 *
 * Run this script to see FreshGuard Core monitoring in action.
 */

import {
  createDatabase,
  checkFreshness,
  checkVolumeAnomaly,
  type MonitoringRule,
  type CheckResult,
  type Database
} from '@thias-se/freshguard-core';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshguard_user:freshguard_password@localhost:5432/freshguard_example';

// Configuration for monitoring rules
const MONITORING_RULES: MonitoringRule[] = [
  {
    id: 'orders-freshness',
    workspaceId: 'self-hosted-example',
    sourceId: 'postgres_example',
    name: 'Orders Freshness Check',
    tableName: 'orders',
    ruleType: 'freshness',
    toleranceMinutes: 60, // Alert if no orders updated in last 60 minutes
    timestampColumn: 'updated_at',
    checkIntervalMinutes: 5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'events-volume',
    workspaceId: 'self-hosted-example',
    sourceId: 'postgres_example',
    name: 'User Events Volume Check',
    tableName: 'user_events',
    ruleType: 'volume',
    toleranceMinutes: 30, // Check volume patterns over 30-minute windows
    timestampColumn: 'timestamp',
    checkIntervalMinutes: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function main() {
  console.log('🔍 FreshGuard Monitoring Example\n');
  console.log(`📊 Monitoring ${MONITORING_RULES.length} rules...`);
  console.log(`🕐 Started at: ${new Date().toISOString()}\n`);

  let db: Database;

  try {
    // Connect to database
    db = createDatabase(DATABASE_URL);
    console.log('✅ Connected to database\n');

    // Run monitoring checks for each rule
    const results: Array<{ rule: MonitoringRule; result: CheckResult }> = [];

    for (const rule of MONITORING_RULES) {
      console.log(`🔎 Checking: ${rule.name}`);
      console.log(`   Table: ${rule.tableName}`);
      console.log(`   Type: ${rule.ruleType}`);

      try {
        let result: CheckResult;

        if (rule.ruleType === 'freshness') {
          result = await checkFreshness(db, rule);
        } else if (rule.ruleType === 'volume') {
          result = await checkVolumeAnomaly(db, rule);
        } else {
          throw new Error(`Unknown rule type: ${rule.ruleType}`);
        }

        results.push({ rule, result });
        displayCheckResult(rule, result);

      } catch (error) {
        console.error(`   ❌ Error checking rule: ${error}`);
      }

      console.log(); // Empty line for readability
    }

    // Summary
    console.log('📋 MONITORING SUMMARY');
    console.log('=' .repeat(50));
    displaySummary(results);

    // Demonstrate alert handling
    console.log('\n🚨 ALERT HANDLING DEMONSTRATION');
    console.log('=' .repeat(50));
    handleAlerts(results);

    console.log('\n✅ Monitoring check completed');

  } catch (error) {
    console.error('❌ Monitoring failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Run `npm run setup` first to verify database connection');
    console.log('2. Make sure PostgreSQL is running: `docker-compose up -d`');
    console.log('3. Check that sample data exists in the database');
    process.exit(1);
  }
}

function displayCheckResult(rule: MonitoringRule, result: CheckResult): void {
  const statusEmoji = result.status === 'alert' ? '🚨' : result.status === 'warning' ? '⚠️' : '✅';
  console.log(`   Status: ${statusEmoji} ${result.status.toUpperCase()}`);

  if (rule.ruleType === 'freshness') {
    console.log(`   Data lag: ${result.lagMinutes} minutes`);
    console.log(`   Tolerance: ${rule.toleranceMinutes} minutes`);
    if (result.lastUpdateTime) {
      console.log(`   Last update: ${new Date(result.lastUpdateTime).toLocaleString()}`);
    }
  } else if (rule.ruleType === 'volume') {
    if (result.currentValue !== undefined) {
      console.log(`   Current count: ${result.currentValue}`);
    }
    if (result.expectedValue !== undefined) {
      console.log(`   Expected count: ${result.expectedValue}`);
    }
    if (result.deviation !== undefined) {
      console.log(`   Deviation: ${result.deviation}%`);
    }
  }

  if (result.message) {
    console.log(`   Message: ${result.message}`);
  }
}

function displaySummary(results: Array<{ rule: MonitoringRule; result: CheckResult }>): void {
  const alertCount = results.filter(r => r.result.status === 'alert').length;
  const warningCount = results.filter(r => r.result.status === 'warning').length;
  const okCount = results.filter(r => r.result.status === 'ok').length;

  console.log(`Total checks: ${results.length}`);
  console.log(`🚨 Alerts: ${alertCount}`);
  console.log(`⚠️ Warnings: ${warningCount}`);
  console.log(`✅ OK: ${okCount}`);

  if (alertCount > 0) {
    console.log('\nRules with alerts:');
    results
      .filter(r => r.result.status === 'alert')
      .forEach(({ rule, result }) => {
        console.log(`  • ${rule.name}: ${result.message || 'Alert condition met'}`);
      });
  }
}

function handleAlerts(results: Array<{ rule: MonitoringRule; result: CheckResult }>): void {
  const alertingResults = results.filter(r => r.result.status === 'alert');

  if (alertingResults.length === 0) {
    console.log('✅ No alerts to handle - all checks passed!');
    console.log('\n💡 To see alerts in action:');
    console.log('   1. Reduce toleranceMinutes in the rules above (e.g., to 5 minutes)');
    console.log('   2. Wait for data to become stale');
    console.log('   3. Or modify the sample data timestamps in the database');
    return;
  }

  console.log(`🚨 Found ${alertingResults.length} alert(s) that would trigger notifications:\n`);

  alertingResults.forEach(({ rule, result }, index) => {
    console.log(`Alert ${index + 1}: ${rule.name}`);
    console.log(`  Rule ID: ${rule.id}`);
    console.log(`  Table: ${rule.tableName}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Message: ${result.message || 'Alert threshold exceeded'}`);

    if (rule.ruleType === 'freshness') {
      console.log(`  Data is ${result.lagMinutes} minutes old (tolerance: ${rule.toleranceMinutes}m)`);
    }

    // Simulate different alert destinations
    console.log('  📧 Would send to: email@example.com');
    console.log('  💬 Would post to: #data-alerts Slack channel');
    console.log('  📱 Would trigger: PagerDuty incident');
    console.log();
  });

  console.log('💡 In a production setup, you would:');
  console.log('   • Send emails using nodemailer or similar');
  console.log('   • Post to Slack using webhook URLs');
  console.log('   • Create PagerDuty incidents via their API');
  console.log('   • Log to external monitoring systems');
  console.log('   • Store alert history in a database');
}

// Additional utility function to simulate a production monitoring loop
function simulateScheduledMonitoring(): void {
  console.log('\n⏰ PRODUCTION SCHEDULING EXAMPLE');
  console.log('=' .repeat(50));
  console.log('In production, you might run this check on a schedule:');
  console.log(`
// Using node-cron for scheduling
import cron from 'node-cron';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running scheduled monitoring check...');
  await runMonitoringChecks();
});

// Or using a simple setInterval
setInterval(async () => {
  await runMonitoringChecks();
}, 5 * 60 * 1000); // 5 minutes
  `);
}

// Run the monitoring
main()
  .then(() => {
    simulateScheduledMonitoring();
  })
  .catch(console.error);