import { ErrorStatus } from '@atls/grpc-error-status'

const isGrpcErrorStatus = (error) => error.code >= 0 && error.metadata && error.details

export const formatError = (error) => {
  if (error.extensions?.exception && isGrpcErrorStatus(error.extensions.exception)) {
    // eslint-disable-next-line no-param-reassign
    error.extensions.exception = ErrorStatus.fromServiceError(error.extensions.exception).toObject()
  }

  return error
}
