import type { ServiceError } from '@grpc/grpc-js'

import { ErrorStatus }       from '@atls/grpc-error-status'

type ErrorExtensions = {
  exception?: Record<string, unknown> | ServiceError
}

const isGrpcErrorStatus = (error: Record<string, unknown> | ServiceError): error is ServiceError =>
  Number(error.code) >= 0 && error.metadata !== undefined && error.details !== undefined

export const formatError = (error: { extensions?: ErrorExtensions }) => {
  const exception = error.extensions?.exception
  if (exception && isGrpcErrorStatus(exception)) {
    error.extensions = {
      ...error.extensions,
      exception: ErrorStatus.fromServiceError(exception).toObject(),
    }
  }

  return error
}
