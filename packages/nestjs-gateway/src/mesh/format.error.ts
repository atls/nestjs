import type { ServiceError } from '@grpc/grpc-js'

import { ErrorStatus }       from '@atls/grpc-error-status'

const isGrpcErrorStatus = (error: { code: number; metadata: any; details: any }): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  error.code >= 0 && error.metadata && error.details

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const formatError = (error: { extensions: { exception: ServiceError } }) => {
  if (error.extensions?.exception && isGrpcErrorStatus(error.extensions.exception)) {
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    error.extensions.exception = ErrorStatus.fromServiceError(error.extensions.exception).toObject()
  }

  return error
}
