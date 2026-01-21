#!/usr/bin/env tsx

/**
 * FreshGuard Basic Example - Setup Script
 *
 * This script demonstrates how to:
 * 1. Connect to a PostgreSQL database
 * 2. Verify the connection
 * 3. Set up monitoring rules for freshness and volume checks
 *
 * Run this after starting the Docker PostgreSQL container.
 */

import { createDatabase, type MonitoringRule, type Database } from '@thias-se/freshguard-core';
import { config } from 'dotenv';

// Load environment variables
config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://freshguard_user:freshguard_password@localhost:5432/freshguard_example';

async function main() {
  console.log('🚀 Setting up FreshGuard monitoring example...\n');

  let db: Database;

  try {
    // Step 1: Create database connection
    console.log('📡 Connecting to PostgreSQL...');
    db = createDatabase(DATABASE_URL);
    console.log('✅ Database connection established');

    // Step 2: Test the connection by running a simple query
    console.log('\n🔍 Testing database connection...');
    await testConnection(db);
    console.log('✅ Database connection test passed');

    // Step 3: Verify sample data exists
    console.log('\n📊 Checking sample data...');
    await verifySampleData(db);
    console.log('✅ Sample data verified');

    // Step 4: Display monitoring rules configuration
    console.log('\n⚙️ Monitoring rules configuration:');
    displayMonitoringRules();

    console.log('\n✨ Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run `npm run monitor` to start monitoring');
    console.log('2. Try modifying the toleranceMinutes in monitor.ts');
    console.log('3. Wait a few minutes and run monitoring again to see stale data alerts');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running: `docker-compose up -d`');
    console.log('2. Wait for the database to be ready (check health status)');
    console.log('3. Verify connection string in .env file');
    process.exit(1);
  }
}

async function testConnection(db: Database): Promise<void> {
  try {
    // Test with a simple query
    const result = await db.execute('SELECT NOW() as current_time, version() as db_version');
    console.log(`   Database time: ${result[0]?.current_time}`);
    console.log(`   PostgreSQL version: ${result[0]?.db_version?.split(' ')[0]}`);
  } catch (error) {
    throw new Error(`Database connection test failed: ${error}`);
  }
}

async function verifySampleData(db: Database): Promise<void> {
  try {
    // Check orders table
    const ordersResult = await db.execute('SELECT COUNT(*) as count FROM orders');
    const ordersCount = ordersResult[0]?.count;
    console.log(`   Orders table: ${ordersCount} rows`);

    // Check user_events table
    const eventsResult = await db.execute('SELECT COUNT(*) as count FROM user_events');
    const eventsCount = eventsResult[0]?.count;
    console.log(`   User events table: ${eventsCount} rows`);

    // Show latest order update
    const latestOrderResult = await db.execute(`
      SELECT updated_at,
             EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_ago
      FROM orders
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    const latestOrder = latestOrderResult[0];
    if (latestOrder) {
      console.log(`   Latest order updated: ${Math.round(latestOrder.minutes_ago)} minutes ago`);
    }

    if (ordersCount === 0 || eventsCount === 0) {
      throw new Error('Sample data not found. Make sure the init.sql script ran properly.');
    }
  } catch (error) {
    throw new Error(`Sample data verification failed: ${error}`);
  }
}

function displayMonitoringRules(): void {
  console.log(`
📋 Configured monitoring rules:

1. Orders Freshness Check:
   - Table: orders
   - Timestamp Column: updated_at
   - Tolerance: 60 minutes
   - Check Interval: 5 minutes
   - Alert when: No orders updated in last 60 minutes

2. User Events Volume Check:
   - Table: user_events
   - Timestamp Column: timestamp
   - Check Interval: 10 minutes
   - Alert when: Significant deviation from baseline volume

💡 Tips:
   - The orders table starts with recent data, so freshness should pass initially
   - Wait 60+ minutes or adjust tolerance to see freshness alerts
   - Volume checks compare recent data to historical patterns
  `);
}

// Run the setup
main().catch(console.error);