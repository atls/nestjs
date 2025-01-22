/* eslint-disable @typescript-eslint/no-empty-function */

import type { ValidationError as ValError } from '@nestjs/common'

import { ValidationError }                  from '@atls/protobuf-rpc'
import { ValidationErrorMessage }           from '@atls/protobuf-rpc'
import { Code }                             from '@connectrpc/connect'
import { ConnectError }                     from '@connectrpc/connect'
import { RpcException }                     from '@nestjs/microservices'

const traverseErrors = (
  errors: Array<ValError> = [],
  callback: (error: ValError, id: string, property: string) => void = (): void => {},
  path: Array<string> = []
): void => {
  errors.forEach((error) => {
    const currentPath = [...path, error.property]

    if (error.constraints) {
      callback(error, currentPath.join('.'), error.property)
    }

    traverseErrors(error.children, callback, currentPath)
  })
}

export const validationExceptionFactory = (errors: Array<ValError>): RpcException => {
  const validationErrors: Array<ValidationError> = []

  traverseErrors(errors, (error, id, property) => {
    const messages = Object.keys(error.constraints || {}).map((constraintId) => {
      // @ts-expect-error types
      const validationErrorMessage = new ValidationErrorMessage({
        id: constraintId,
        constraint: error.constraints![constraintId],
      })

      return validationErrorMessage
    })

    validationErrors.push(
      // @ts-expect-error types
      new ValidationError({
        id,
        property,
        messages,
      })
    )
  })

  return new RpcException(
    // @ts-expect-error types
    new ConnectError('Request validation failed', Code.InvalidArgument, undefined, validationErrors)
  )
}
