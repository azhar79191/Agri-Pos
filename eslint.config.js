import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

// ESLint core does not count JSX tags as variable reads. Mark the actual
// component binding as used, including local render-prop/destructured icons.
const jsxUsage = {
  rules: {
    'uses-vars': {
      meta: { messages: { undefined: "JSX component '{{name}}' is not defined." } },
      create: context => ({
        JSXOpeningElement(node) {
          let name = node.name;
          while (name.type === 'JSXMemberExpression') name = name.object;
          if (name.type === 'JSXIdentifier' && (node.name.type === 'JSXMemberExpression' || /^[A-Z]/.test(name.name))) {
            context.sourceCode.markVariableAsUsed(name.name, node);
            let scope = context.sourceCode.getScope(node);
            while (scope && !scope.set.has(name.name)) scope = scope.upper;
            if (!scope) context.report({ node: name, messageId: 'undefined', data: { name: name.name } });
          }
        },
      }),
    },
  },
};

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh, jsx: jsxUsage },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      'jsx/uses-vars': 'error',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  { files: ['public/sw.js'], languageOptions: { globals: globals.serviceworker } },
]);
