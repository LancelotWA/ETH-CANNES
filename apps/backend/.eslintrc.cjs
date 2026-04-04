module.exports = {
  root: true,
  extends: ["../../packages/config/eslint/nest.cjs"],
  env: {
    node: true,
    jest: true
  },
  parserOptions: {
    project: "./tsconfig.json"
  }
};
