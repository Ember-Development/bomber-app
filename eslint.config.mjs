import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
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
      'react/react-in-jsx-scope': 'off', // seems to be an outdated rule... smh... read more [here](https://www.reddit.com/r/react/comments/11d8xjk/srcappjs_line_2_react_must_be_in_scope_when_using/)
      'react/no-unescaped-entities': 'warn',
    },
  },

  //WARNING: do not move this! it has to be last for prettier to work!
  eslintConfigPrettier,
];
