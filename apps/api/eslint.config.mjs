import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import hono from 'eslint-plugin-hono';
import drizzle from 'eslint-plugin-drizzle';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      hono,
      prettier,
      drizzle
    },
    rules: {
      // Hono Rules
      ...hono.configs.recommended.rules,

      // TypeScript Rules
      '@typescript-eslint/no-empty-object-type': 'off',
      // allows `declare global { namespace NodeJS { ... } }` augmentation (see src/env.ts)
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn', // or "error"
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // General Code Style
      'prettier/prettier': 'warn',
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  {
    // standalone CLI scripts (migrate, seed, ...) report progress via the console
    files: ['db/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  }
);
