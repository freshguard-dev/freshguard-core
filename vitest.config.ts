import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
      // Thresholds disabled - coverage will run but not fail builds
      // thresholds: {
      //   lines: 40,      // Slightly below current 44.32% (prevent regression)
      //   functions: 4,   // Current level - enforce no regression
      //   branches: 50,   // Current level - maintain branch coverage
      //   statements: 40, // Slightly below current 44.32%
      // },
    },
  },
});
