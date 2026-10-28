import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importX from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsFiles = ['**/*.{ts,tsx,mts,cts}'];

export default defineConfig([
  globalIgnores([
    'dist/**',
    'storybook-static/**',
    'coverage/**',
    'node_modules/**',
    'eslint.config.mjs',
    'prettier.config.mjs',
    'lint-staged.config.mjs',
    'scripts/**',
    '.storybook/vite.config.ts',
  ]),

  js.configs.recommended,

  {
    files: tsFiles,
    extends: [tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'import-x': importX,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Components are re-exported through the barrel; that is intentional.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },

  {
    files: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },

  {
    files: ['src/**/*.test.{ts,tsx}'],
    extends: [testingLibrary.configs['flat/react']],
    rules: {
      // These tests assert the rendered markup directly: the data-slot hooks and
      // class contracts consumers rely on have no accessible query equivalent.
      'testing-library/no-node-access': 'off',
      'testing-library/no-container': 'off',
    },
  },

  prettierRecommended,
]);
