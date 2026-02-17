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
    const instance = await DuckDBInstance.create(DUCKDB_TEST_PATH);
    const connection = await instance.connect();

    console.log('Running initialization SQL...');

    // DuckDB supports multiple statements in a single run() call
    await connection.run(initSQL);

    // Verify the setup by counting records
    console.log('\nVerifying database setup...');
    const tables = ['customers', 'products', 'orders', 'daily_summary', 'user_sessions'];

    for (const table of tables) {
      try {
        const reader = await connection.runAndReadAll(`SELECT COUNT(*) as count FROM ${table}`);
        const rows = reader.getRows();
        const count = rows[0][0];
        console.log(`✓ ${table}: ${count} records`);
      } catch (error) {
        console.error(`✗ Failed to count ${table}: ${error.message}`);
      }
    }

    connection.closeSync();
    instance.closeSync();

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