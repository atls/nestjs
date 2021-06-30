/* eslint-disable */

Object.defineProperty(exports, '__esModule', { value: true })
exports.serverReflectionPath = void 0
const path_1 = require('path')
exports.serverReflectionPath =
  typeof __non_webpack_require__ === 'undefined'
    ? path_1.join(__dirname, './grpc/reflection/v1alpha/reflection.proto')
    : require('./grpc/reflection/v1alpha/reflection.proto').default
