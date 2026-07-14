module.exports = {
  root: true,
  extends: ['@launchos/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
