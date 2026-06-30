import type { MetadataValue }        from '@grpc/grpc-js'
import type { ClientReadableStream } from '@grpc/grpc-js'
import type { ClientUnaryCall }      from '@grpc/grpc-js'
import type { SchemaComposer }       from 'graphql-compose'
import type { Root }                 from 'protobufjs'

import { existsSync }                from 'node:fs'
import { isAbsolute }                from 'node:path'
import { join }                      from 'node:path'

import { Metadata }                  from '@grpc/grpc-js'
import _                             from 'lodash'

import { getGraphQLScalar }          from './scalars.js'
import { isScalarType }              from './scalars.js'

export type ClientMethod = (
  input: unknown,
  metaData?: Metadata
) => AsyncIterator<ClientReadableStream<unknown>> | Promise<ClientUnaryCall>

const stringifyMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  return JSON.stringify(value)
}

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

  root.resolvePath = (origin: string, target: string): string | null => {
    if (isAbsolute(target)) {
      return target
    }
    for (const directory of includePaths) {
      const fullPath: string = join(directory, target)
      // eslint-disable-next-line n/no-sync
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
  metaData?: Record<string, Array<string> | Buffer | string>
): AsyncIterator<ClientReadableStream<unknown>> | Promise<ClientUnaryCall> {
  if (!metaData) {
    return call(input)
  }

  const meta = new Metadata()
  for (const [key, value] of Object.entries(metaData)) {
    let metaValue: unknown = value
    if (Array.isArray(value)) {
      // Extract data from context
      metaValue = _.get(context, value)
    }
    // Ensure that the metadata is compatible with what node-grpc expects
    if (typeof metaValue !== 'string' && !(metaValue instanceof Buffer)) {
      metaValue = stringifyMetadataValue(metaValue)
    }

    meta.add(key, metaValue as MetadataValue)
  }

  return call(input, meta)
}
