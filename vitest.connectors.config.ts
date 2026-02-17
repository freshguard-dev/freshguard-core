import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/connectors/integration-all.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      TEST_POSTGRES_URL: 'postgresql://test:test@localhost:5433/freshguard_test',
    },
  },
});
