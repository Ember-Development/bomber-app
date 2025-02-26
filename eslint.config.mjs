import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  //for whatever reason these two are special
  {
    plugins: {
      'react-hooks': reactHooks,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    plugins: {
      'react-refresh': reactRefresh,
    },

    rules: {
      ...reactRefresh.configs.recommended.rules,
    },
  },

  {
    ignores: [
      'coverage',
      '**/public',
      '**/dist',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
    ],
  },

  {
    rules: {
      // deprecated rule read [here](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md)
      'react/react-in-jsx-scope': 'off',
      // i understand the rule but i dont respect it [here](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md)
      'react/no-unescaped-entities': 'warn',
    },
  },

  {
    files: [
      'apps/mobile/**/*.ts',
      'apps/mobile/**/*.tsx',
      'apps/mobile/**/*.js',
      'apps/mobile/**/*.jsx',
    ],
    rules: {
      // expo needs require() imports to get assets like images
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  //WARNING: do not move this! it has to be last for prettier to work!
  { ...eslintConfigPrettier },
];
