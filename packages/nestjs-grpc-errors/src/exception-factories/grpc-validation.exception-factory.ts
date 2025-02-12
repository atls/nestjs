import type { ValidationError } from '@nestjs/common'

import * as grpcErrorStatus     from '@atls/grpc-error-status'
import { RpcException }         from '@nestjs/microservices'
import { status }               from '@grpc/grpc-js'

const { BadRequest, ErrorStatus } = grpcErrorStatus

const traverseErrors = (
  errors: Array<ValidationError> = [],
  callback: (error: ValidationError, string: string) => void = () => undefined,
  path: Array<string> = []
): void => {
  errors.forEach((error) => {
    const currentPath = [...path, error.property]

    if (error.constraints) {
      callback(error, currentPath.join('.'))
    }

    traverseErrors(error.children, callback, currentPath)
  })
}

export const grpcValidationExceptionFactory = (errors: Array<ValidationError>): RpcException => {
  const badRequest = new BadRequest()

  traverseErrors(errors, (error, field) => {
    Object.values(error.constraints || {}).forEach((description) => {
      const fieldViolation = new BadRequest.FieldViolation()

      fieldViolation.setField(field)
      fieldViolation.setDescription(description)

      badRequest.addFieldViolations(fieldViolation)
    })
  })

  const errorStatus = new ErrorStatus(status.INVALID_ARGUMENT, 'Request validation failed')

  errorStatus.addDetail(badRequest)

  return new RpcException(errorStatus.toServiceError())
}
