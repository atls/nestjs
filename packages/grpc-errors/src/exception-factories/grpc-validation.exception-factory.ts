import { BadRequest }      from '@atls/grpc-error-status'
import { ErrorStatus }     from '@atls/grpc-error-status'
import { ValidationError } from '@nestjs/common'
import { RpcException }    from '@nestjs/microservices'
import { status }          from '@grpc/grpc-js'

const traverseErrors = (
  errors: ValidationError[] = [],
  callback: (error: ValidationError, string) => void,
  path: string[] = []
) => {
  errors.forEach((error) => {
    const currentPath = [...path, error.property]

    if (error.constraints) {
      callback(error, currentPath.join('.'))
    }

    traverseErrors(error.children, callback, currentPath)
  })
}

export const grpcValidationExceptionFactory = (errors: ValidationError[]) => {
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
