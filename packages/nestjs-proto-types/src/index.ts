/**
 * Declares a module for `.proto` files, which are commonly used for defining
 * Protocol Buffers (protobuf) schemas.
 *
 * This declaration allows TypeScript to recognize `.proto` files as modules
 * that can be imported directly in TypeScript projects, enabling integration
 * with Protocol Buffers in environments where `.proto` files are parsed or
 * used as source definitions for generating classes and types.
 *
 * @module
 * @typedef {string} ProtoFile - Represents the imported `.proto` file as a string
 */
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-expect-error correct module name
declare module '*.proto'
