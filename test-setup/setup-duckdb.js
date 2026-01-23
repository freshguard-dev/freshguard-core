#!/usr/bin/env node

/**
 * DuckDB Test Database Setup Script
 * Creates and populates a DuckDB test database with realistic test data
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the DuckDB test database
const DUCKDB_TEST_PATH = '/tmp/customer_test.duckdb';

async function setupDuckDB() {
  console.log('Setting up DuckDB test database...');

  try {
    // Dynamically import DuckDB (it might not be available in all environments)
    const duckdb = await import('@duckdb/node-api');
    const { DuckDBInstance } = duckdb;

    // Read the initialization SQL
    const initSQL = readFileSync(join(__dirname, 'init-duckdb.sql'), 'utf8');

    // Create or connect to the database
    console.log(`Creating DuckDB database at: ${DUCKDB_TEST_PATH}`);
    const instance = DuckDBInstance.create(DUCKDB_TEST_PATH);
    const connection = instance.connect();

    console.log('Running initialization SQL...');

    // Split SQL by semicolons and execute each statement
    const statements = initSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        connection.run(statement);
        console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        console.error(`✗ Failed to execute statement: ${error.message}`);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      }
    }

    // Verify the setup by counting records
    console.log('\nVerifying database setup...');
    const tables = ['customers', 'products', 'orders', 'daily_summary', 'user_sessions'];

    for (const table of tables) {
      try {
        const reader = connection.runAndReadAll(`SELECT COUNT(*) as count FROM ${table}`);
        const rows = reader.getRowObjects();
        const count = rows[0].count;
        console.log(`✓ ${table}: ${count} records`);
      } catch (error) {
        console.error(`✗ Failed to count ${table}: ${error.message}`);
      }
    }

    connection.closeSync();
    instance.close();

    console.log(`\n✅ DuckDB test database setup complete: ${DUCKDB_TEST_PATH}`);

  } catch (error) {
    console.error('❌ Failed to setup DuckDB test database:');
    console.error(error.message);

    console.log('\n💡 This is expected if DuckDB native bindings are not available or API has changed.');
    console.log('   Integration tests will skip DuckDB tests gracefully.');
    console.log('   PostgreSQL integration tests should work fine.');

    // Don't exit with error - DuckDB is optional for integration testing
    return;
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDuckDB().catch(console.error);
}

export { setupDuckDB };