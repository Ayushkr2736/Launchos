module.exports = {
  root: true,
  extends: ['@launchos/eslint-config/node'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
