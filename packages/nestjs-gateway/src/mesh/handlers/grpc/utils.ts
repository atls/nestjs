import type { MetadataValue }        from '@grpc/grpc-js'
import type { ClientReadableStream } from '@grpc/grpc-js'
import type { ClientUnaryCall }      from '@grpc/grpc-js'
import type { SchemaComposer }       from 'graphql-compose'
import type { Root }                 from 'protobufjs'

import { Metadata }                  from '@grpc/grpc-js'
// @ts-expect-error jsonFlatStringify types are missing in the published package
import { jsonFlatStringify }         from '@graphql-mesh/utils'
import { existsSync }                from 'fs'
import { isAbsolute }                from 'path'
import { join }                      from 'path'
import _                             from 'lodash'

import { getGraphQLScalar }          from './scalars.js'
import { isScalarType }              from './scalars.js'

export type ClientMethod = (
  input: unknown,
  metaData?: Metadata
) => AsyncIterator<ClientReadableStream<unknown>> | Promise<ClientUnaryCall>

export function getTypeName(
  schemaComposer: SchemaComposer,
  pathWithName: Array<string> | undefined,
  isInput: boolean
): string {
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

export function addIncludePathResolver(root: Root, includePaths: Array<string>): void {
  const originalResolvePath = root.resolvePath
  // eslint-disable-next-line no-param-reassign
  root.resolvePath = (origin: string, target: string): string | null => {
    if (isAbsolute(target)) {
      return target
    }
    for (const directory of includePaths) {
      const fullPath: string = join(directory, target)
      // eslint-disable-next-line n/no-sync -- root.resolvePath API is synchronous, so the file check must match
      if (existsSync(fullPath)) {
        return fullPath
      }
    }
    const path = originalResolvePath(origin, target)
    if (path === null) {
      // eslint-disable-next-line no-console
      console.warn(`${target} not found in any of the include paths ${includePaths.join(', ')}`)
    }
    return path
  }
}

export function addMetaDataToCall(
  call: ClientMethod,
  input: unknown,
  context: Record<string, unknown>,
  metaData: Record<string, Array<string> | Buffer | string>
): AsyncIterator<ClientReadableStream<unknown>> | Promise<ClientUnaryCall> {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        metaValue = jsonFlatStringify(metaValue)
      }

      meta.add(key, metaValue as MetadataValue)
    }

    return call(input, meta)
  }
  return call(input)
}
