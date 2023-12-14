require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends:
    './.yarn/unplugged/@atls-config-eslint-npm-0.0.10-fcb02bb484/node_modules/@atls/config-eslint/dist/eslintrc.js',
  parserOptions: {
    project: './tsconfig.json',
  },
}
