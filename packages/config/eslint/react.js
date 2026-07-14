/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.js', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true, allowExportNames: ['buttonVariants'] },
    ],
  },
  env: {
    browser: true,
    es2022: true,
  },
};
