import type { ServiceError }          from '@grpc/grpc-js'
import type { GraphQLFormattedError } from 'graphql'

import { status }                     from '@grpc/grpc-js'

type ErrorExtensions = {
  exception?: Record<string, unknown> | ServiceError
}

const grpcErrorMessagePattern = /^(?<code>\d+)\s+(?<status>[A-Z_]+):\s*(?<message>.*)$/

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

const formatGrpcError = (error: ServiceError): Record<string, unknown> => ({
  status: status[error.code],
  code: error.code,
  message: error.details || error.message,
  details: [],
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
