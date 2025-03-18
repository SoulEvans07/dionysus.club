import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import prettierConfig from 'eslint-config-prettier';
import hono from 'eslint-plugin-hono';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      hono: hono,
      prettier,
    },
    rules: {
      // Hono Rules
      'hono/no-unnecessary-middleware': 'warn',
      'hono/no-invalid-routing': 'error',

      // TypeScript Rules
      '@typescript-eslint/no-empty-object-type': 'off',
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
      'no-console': 'warn',
    },
  }
);
