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
      // Istanbul rather than V8: V8 instruments the first line of every module as
      // a branch it never takes, which added ~60 untakeable branches and made a
      // 90% floor impossible to hold as files were added. Istanbul measures the
      // source instead.
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      include: ['src/components/ui/**/*.tsx', 'src/lib/**/*.{ts,tsx}', 'src/hooks/**/*.ts'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx'],
      // A ratchet: the floors sit just under what the suite covers today, so a
      // new component without tests lowers the numbers and fails the run. Coverage
      // spans both projects — the jsdom suites plus the stories and their play
      // functions — because the interactions only happen in the browser.
      thresholds: {
        lines: 95,
        functions: 94,
        statements: 94,
        branches: 94,
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
