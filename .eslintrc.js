module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'airbnb-base',
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'class-methods-use-this': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'no-unused-vars': 'off',
    'linebreak-style': 0,
    'no-useless-escape': 'off',
    'no-return-await': 'off',
    'no-self-assign': 'off',
  },
};
