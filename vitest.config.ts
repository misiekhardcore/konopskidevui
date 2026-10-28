import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const alias = {
  '@': fileURLToPath(new URL('./src', import.meta.url)),
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/components/ui/**/*.tsx', 'src/lib/**/*.{ts,tsx}', 'src/hooks/**/*.ts'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
      // A ratchet: the floor is what the suite covers today, so a new component
      // without tests lowers the number and fails the run. The utilities are
      // held to a much higher bar than the 63 class-string-heavy components.
      thresholds: {
        lines: 65,
        functions: 60,
        statements: 65,
        branches: 50,
        'src/hooks/**': { lines: 90, functions: 75, statements: 90, branches: 85 },
        'src/lib/**': { lines: 70, functions: 50, statements: 70, branches: 90 },
      },
    },
    projects: [
      {
        // Component behaviour, in jsdom: fast enough to run on every save.
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        // Every story is a test: it must render, and its play function must pass.
        extends: true,
        plugins: [
          storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
