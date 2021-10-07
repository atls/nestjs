/* eslint-disable no-restricted-syntax */

import { jsonFlatStringify }              from '@graphql-mesh/utils'
import { ClientReadableStream }           from '@grpc/grpc-js'
import { ClientUnaryCall }                from '@grpc/grpc-js'
import { Metadata }                       from '@grpc/grpc-js'
import { MetadataValue }                  from '@grpc/grpc-js'
import { SchemaComposer }                 from 'graphql-compose'
import { Root }                           from 'protobufjs'
import _                                  from 'lodash'
import { existsSync }                     from 'fs'
import { isAbsolute, join }               from 'path'

import { getGraphQLScalar, isScalarType } from './scalars'

export type ClientMethod = (
  input: unknown,
  metaData?: Metadata
) => Promise<ClientUnaryCall> | AsyncIterator<ClientReadableStream<unknown>>

export function getTypeName(
  schemaComposer: SchemaComposer,
  pathWithName: string[] | undefined,
  isInput: boolean
) {
  if (pathWithName?.length) {
    const baseTypeName = pathWithName.filter(Boolean).join('_')
    if (isScalarType(baseTypeName)) {
      return getGraphQLScalar(baseTypeName)
    }
    if (schemaComposer.isEnumType(baseTypeName)) {
      return baseTypeName
    }
    return isInput ? `${baseTypeName}_Input` : baseTypeName
  }
  return 'Void'
}

export function addIncludePathResolver(root: Root, includePaths: string[]): void {
  const originalResolvePath = root.resolvePath
  // eslint-disable-next-line no-param-reassign
  root.resolvePath = (origin: string, target: string) => {
    if (isAbsolute(target)) {
      return target
    }
    for (const directory of includePaths) {
      const fullPath: string = join(directory, target)
      if (existsSync(fullPath)) {
        return fullPath
      }
    }
    const path = originalResolvePath(origin, target)
    if (path === null) {
      // eslint-disable-next-line no-console
      console.warn(`${target} not found in any of the include paths ${includePaths}`)
    }
    return path
  }
}

export function addMetaDataToCall(
  call: ClientMethod,
  input: unknown,
  context: Record<string, unknown>,
  metaData: Record<string, string | string[] | Buffer>
): Promise<ClientUnaryCall> | AsyncIterator<ClientReadableStream<unknown>> {
  if (metaData) {
    const meta = new Metadata()
    for (const [key, value] of Object.entries(metaData)) {
      let metaValue: unknown = value
      if (Array.isArray(value)) {
        // Extract data from context
        metaValue = _.get(context, value)
      }
      // Ensure that the metadata is compatible with what node-grpc expects
      if (typeof metaValue !== 'string' && !(metaValue instanceof Buffer)) {
        metaValue = jsonFlatStringify(metaValue)
      }

      meta.add(key, metaValue as MetadataValue)
    }

    return call(input, meta)
  }
  return call(input)
}
