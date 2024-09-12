import { ErrorStatus }  from '@atls/grpc-error-status'
import { ServiceError } from '@grpc/grpc-js'

const isGrpcErrorStatus = (error: { code: number; metadata: any; details: any }) =>
  error.code >= 0 && error.metadata && error.details

export const formatError = (error: { extensions: { exception: ServiceError } }) => {
  if (error.extensions?.exception && isGrpcErrorStatus(error.extensions.exception)) {
    // @ts-ignore eslint-disable-next-line no-param-reassign
    error.extensions.exception = ErrorStatus.fromServiceError(error.extensions.exception).toObject()
  }

  return error
}
