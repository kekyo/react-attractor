import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: [
      'dist*/**',
      '**/dist/**',
      'node_modules/**',
      'demo-output/**',
      '**/playwright.config.ts',
      '**/test-results/**',
      '**/playwright-report/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // プロジェクトごとにtsconfig.jsonを自動検出
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      import: importPlugin,
    },
    rules: {
      ...ts.configs.recommended.rules,
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
      'no-trailing-spaces': ['error', {
        skipBlankLines: false,
        ignoreComments: false,
      }],
      'semi': ['error', 'always'],
      'no-multiple-empty-lines': ['error', {
        max: 1,
        maxEOF: 0,
        maxBOF: 0
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      'import/no-duplicates': 'error',
      // Import order rules
      'import/order': ['error', {
        'groups': [
          'builtin',   // Node.js built-in modules
          'external',  // External libraries
          'internal',  // Internal modules (same package)
          'parent',    // Parent directory imports
          'sibling',   // Sibling directory imports
          'index',     // Index file imports
          'type'       // Type-only imports
        ],
        'newlines-between': 'never',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }],
      'import/first': 'error',
      'import/newline-after-import': 'error',
    },
  },
];
