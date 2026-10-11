module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      // useTranslation lives beside its provider; editing that file does a full reload
      { allowConstantExport: true, allowExportNames: ['useTranslation'] },
    ],
  },
  overrides: [
    {
      // The entry point mounts the app and exports nothing, so it can't hot-reload anyway
      files: ['src/main.tsx'],
      rules: { 'react-refresh/only-export-components': 'off' },
    },
  ],
}
