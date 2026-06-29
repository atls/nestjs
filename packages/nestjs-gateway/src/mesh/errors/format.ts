import type { ServiceError }          from '@grpc/grpc-js'
import type { GraphQLFormattedError } from 'graphql'

import { ErrorStatus }                from '@atls/grpc-error-status'

type ErrorExtensions = {
  exception?: Record<string, unknown> | ServiceError
}

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
        exception: ErrorStatus.fromServiceError(exception).toObject(),
      },
    }
  }

  return error
}
