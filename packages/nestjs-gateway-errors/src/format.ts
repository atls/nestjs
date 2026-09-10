import type { ErrorStatusObject }     from '@atls/grpc-error-status'
import type { ServiceError }          from '@grpc/grpc-js'
import type { GraphQLFormattedError } from 'graphql'

import { ErrorStatus }                from '@atls/grpc-error-status'

type ErrorExtensions = {
  exception?: unknown
}

type ServiceErrorCandidate = Partial<ServiceError> & {
  metadata?: {
    get?: unknown
  }
}

const grpcErrorMessagePattern = /^(?<code>\d+)\s+(?<status>[A-Z_]+):\s*(?<message>[\s\S]*)$/

const isGrpcErrorStatus = (error: unknown): error is ServiceError => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as ServiceErrorCandidate

  return (
    typeof candidate.code === 'number' &&
    Number(candidate.code) >= 0 &&
    typeof candidate.details === 'string' &&
    typeof candidate.metadata?.get === 'function'
  )
}

const formatGrpcMessageErrorStatus = (error: Error): ErrorStatusObject | undefined => {
  const match = grpcErrorMessagePattern.exec(error.message)

  if (!match?.groups) {
    return undefined
  }

  return new ErrorStatus(Number(match.groups.code), match.groups.message).toObject()
}

export const formatGrpcErrorStatus = (error: unknown): ErrorStatusObject | undefined => {
  if (isGrpcErrorStatus(error)) {
    return ErrorStatus.fromServiceError(error).toObject()
  }

  if (error instanceof Error) {
    return formatGrpcMessageErrorStatus(error)
  }

  return undefined
}

export const formatGraphQLGrpcError = (
  error: GraphQLFormattedError & { extensions?: ErrorExtensions },
  exceptionOverride?: unknown
): GraphQLFormattedError => {
  const exception = isGrpcErrorStatus(exceptionOverride)
    ? exceptionOverride
    : error.extensions?.exception
  const formattedException = isGrpcErrorStatus(exception)
    ? formatGrpcErrorStatus(exception)
    : undefined

  if (formattedException) {
    return {
      ...error,
      extensions: {
        ...error.extensions,
        exception: formattedException,
      },
    }
  }

  if (exceptionOverride instanceof Error) {
    const formattedOverride = formatGrpcErrorStatus(exceptionOverride)

    if (formattedOverride) {
      return {
        ...error,
        extensions: {
          ...error.extensions,
          exception: formattedOverride,
        },
      }
    }
  }

  return error
}
