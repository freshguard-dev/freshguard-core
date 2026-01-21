#!/usr/bin/env node

/**
 * FreshGuard CLI
 * Simple command-line interface for self-hosters
 *
 * @module @thias-se/freshguard-core/cli
 */

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case 'init':
      console.log('🚀 FreshGuard Init');
      console.log('');
      console.log('Coming soon! For now, see the documentation:');
      console.log('https://github.com/freshguard/freshguard#self-hosting');
      break;

    case 'test':
      console.log('🔍 Testing connection...');
      console.log('');
      console.log('Coming soon! For now, use the API directly:');
      console.log('https://github.com/freshguard/freshguard/tree/main/packages/core');
      break;

    case 'run':
      console.log('⏱️  Running scheduler...');
      console.log('');
      console.log('Coming soon! For now, see the self-hosting guide:');
      console.log('https://github.com/freshguard/freshguard/blob/main/docs/SELF_HOSTING.md');
      break;

    case 'version':
    case '-v':
    case '--version':
      console.log('FreshGuard Core v0.1.0');
      break;

    case 'help':
    case '-h':
    case '--help':
      printHelp();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('');
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log('FreshGuard CLI - Open Source Data Pipeline Monitoring');
  console.log('');
  console.log('Usage:');
  console.log('  freshguard <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  init      Initialize FreshGuard configuration');
  console.log('  test      Test connection to data source');
  console.log('  run       Run the monitoring scheduler');
  console.log('  version   Show version information');
  console.log('  help      Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  freshguard init postgres://user:pass@localhost/mydb');
  console.log('  freshguard test --source prod_db');
  console.log('  freshguard run --config ./freshguard.yaml');
  console.log('');
  console.log('For more information:');
  console.log('  https://github.com/freshguard/freshguard');
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
