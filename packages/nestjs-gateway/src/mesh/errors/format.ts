import type { ServiceError }          from '@grpc/grpc-js'
import type { GraphQLFormattedError } from 'graphql'

import { createRequire }              from 'node:module'

import { status }                     from '@grpc/grpc-js'

type ErrorExtensions = {
  exception?: Record<string, unknown> | ServiceError
}

type BinaryMessage = {
  toObject: () => unknown
}

type DeserializeBinary = (buffer: Uint8Array) => BinaryMessage

type GoogleRpcAny = {
  getTypeName: () => string
  getTypeUrl: () => string
  unpack: (deserialize: DeserializeBinary, typeName: string) => BinaryMessage | null
}

type GoogleRpcStatus = {
  getDetailsList: () => Array<GoogleRpcAny>
}

type GoogleRpcStatusConstructor = {
  deserializeBinary: (buffer: Uint8Array) => GoogleRpcStatus
}

type GoogleRpcMessageConstructor = {
  deserializeBinary: DeserializeBinary
}

const require = createRequire(import.meta.url)

const { Status } = require('@atls/grpc-error-status/proto/google/rpc/status_pb.js') as {
  Status: GoogleRpcStatusConstructor
}
const errorDetails =
  require('@atls/grpc-error-status/proto/google/rpc/error_details_pb.js') as Record<string, unknown>

const GRPC_ERROR_DETAILS_KEY = 'grpc-status-details-bin'

const grpcErrorMessagePattern = /^(?<code>\d+)\s+(?<status>[A-Z_]+):\s*(?<message>.*)$/

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isGrpcErrorStatus = (error: unknown): error is ServiceError => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as Partial<ServiceError>

  return (
    Number(candidate.code) >= 0 &&
    candidate.metadata !== undefined &&
    candidate.details !== undefined
  )
}

const isGoogleRpcMessageConstructor = (value: unknown): value is GoogleRpcMessageConstructor =>
  isObject(value) && value.deserializeBinary instanceof Function

const resolveDetailDeserializer = (typeName: string): DeserializeBinary | undefined => {
  const key = typeName.startsWith('google.rpc.') ? typeName.replace('google.rpc.', '') : typeName
  const detail = errorDetails[key]

  if (!isGoogleRpcMessageConstructor(detail)) {
    return undefined
  }

  return detail.deserializeBinary
}

const resolveGrpcErrorDetails = (error: ServiceError): Array<unknown> => {
  const values = error.metadata.get(GRPC_ERROR_DETAILS_KEY)

  if (values.length === 0) {
    return []
  }

  const [buffer] = values

  if (typeof buffer === 'string') {
    return []
  }

  return Status.deserializeBinary(buffer)
    .getDetailsList()
    .reduce<Array<unknown>>((result, detail) => {
      const typeName = detail.getTypeName()
      const deserialize = resolveDetailDeserializer(typeName)

      if (!deserialize) {
        return result
      }

      const message = detail.unpack(deserialize, typeName)

      if (!message) {
        return result
      }

      const data = message.toObject()

      if (!isObject(data)) {
        result.push(data)

        return result
      }

      result.push({
        '@type': detail.getTypeUrl(),
        ...data,
      })

      return result
    }, [])
}

const formatGrpcError = (error: ServiceError): Record<string, unknown> => ({
  status: status[error.code],
  code: error.code,
  message: error.details || error.message,
  details: resolveGrpcErrorDetails(error),
})

const formatGrpcMessageError = (error: Error): Record<string, unknown> | undefined => {
  const match = grpcErrorMessagePattern.exec(error.message)

  if (!match?.groups) {
    return undefined
  }

  return {
    status: match.groups.status,
    code: Number(match.groups.code),
    message: match.groups.message,
    details: [],
  }
}

export const formatError = (
  error: GraphQLFormattedError & { extensions?: ErrorExtensions },
  exceptionOverride?: unknown
): GraphQLFormattedError => {
  const exception = isGrpcErrorStatus(exceptionOverride)
    ? exceptionOverride
    : error.extensions?.exception

  if (exception && isGrpcErrorStatus(exception)) {
    return {
      ...error,
      extensions: {
        ...error.extensions,
        exception: formatGrpcError(exception),
      },
    }
  }

  if (exceptionOverride instanceof Error) {
    const formattedException = formatGrpcMessageError(exceptionOverride)

    if (formattedException) {
      return {
        ...error,
        extensions: {
          ...error.extensions,
          exception: formattedException,
        },
      }
    }
  }

  return error
}
