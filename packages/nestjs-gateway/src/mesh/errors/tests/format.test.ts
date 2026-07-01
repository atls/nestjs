import assert          from 'node:assert/strict'
import { describe }    from 'node:test'
import { it }          from 'node:test'

import { BadRequest }  from '@atls/grpc-error-status'
import { ErrorStatus } from '@atls/grpc-error-status'
import { status }      from '@grpc/grpc-js'

import { formatError } from '../format.js'

describe('formatError', () => {
  it('formats direct gRPC service errors', () => {
    const serviceError = new ErrorStatus(status.INVALID_ARGUMENT, 'Test').toServiceError()

    const formattedError = formatError({
      message: '3 INVALID_ARGUMENT: Test',
      extensions: {
        exception: serviceError,
      },
    })

    assert.deepEqual(formattedError.extensions?.exception, {
      status: 'INVALID_ARGUMENT',
      code: status.INVALID_ARGUMENT,
      message: 'Test',
      details: [],
    })
  })

  it('preserves gRPC status details', () => {
    const violation = new BadRequest.FieldViolation()
    const badRequest = new BadRequest()

    violation.setField('id')
    violation.setDescription('id must be an email')
    badRequest.addFieldViolations(violation)
    const serviceError = new ErrorStatus(status.INVALID_ARGUMENT, 'Request validation failed')
      .addDetail(badRequest)
      .toServiceError()

    const formattedError = formatError({
      message: '3 INVALID_ARGUMENT: Request validation failed',
      extensions: {
        exception: serviceError,
      },
    })

    assert.deepEqual(formattedError.extensions?.exception, {
      status: 'INVALID_ARGUMENT',
      code: status.INVALID_ARGUMENT,
      message: 'Request validation failed',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.BadRequest',
          fieldViolationsList: [
            {
              field: 'id',
              description: 'id must be an email',
            },
          ],
        },
      ],
    })
  })

  it('formats gRPC errors unwrapped as regular errors', () => {
    const formattedError = formatError(
      {
        message: '3 INVALID_ARGUMENT: Test',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      new Error('3 INVALID_ARGUMENT: Test')
    )

    assert.deepEqual(formattedError.extensions?.exception, {
      status: 'INVALID_ARGUMENT',
      code: status.INVALID_ARGUMENT,
      message: 'Test',
      details: [],
    })
  })
})
