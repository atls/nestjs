import assert                     from 'node:assert/strict'
import { describe }               from 'node:test'
import { it }                     from 'node:test'

import { BadRequest }             from '@atls/grpc-error-status'
import { ErrorStatus }            from '@atls/grpc-error-status'
import { status }                 from '@grpc/grpc-js'

import { formatGraphQLGrpcError } from '../format.js'
import { formatGrpcErrorStatus }  from '../format.js'

describe('formatGrpcErrorStatus', () => {
  it('formats direct gRPC service errors', () => {
    const serviceError = new ErrorStatus(status.INVALID_ARGUMENT, 'Test').toServiceError()

    assert.deepEqual(formatGrpcErrorStatus(serviceError), {
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

    assert.deepEqual(formatGrpcErrorStatus(serviceError), {
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
    assert.deepEqual(formatGrpcErrorStatus(new Error('3 INVALID_ARGUMENT: Test')), {
      status: 'INVALID_ARGUMENT',
      code: status.INVALID_ARGUMENT,
      message: 'Test',
      details: [],
    })
  })

  it('formats GraphQL boundary statuses from gRPC service errors', () => {
    const cases = [
      [status.ALREADY_EXISTS, 'ALREADY_EXISTS'],
      [status.INVALID_ARGUMENT, 'INVALID_ARGUMENT'],
      [status.UNAUTHENTICATED, 'UNAUTHENTICATED'],
      [status.UNAVAILABLE, 'UNAVAILABLE'],
    ] as const

    for (const [code, expectedStatus] of cases) {
      const serviceError = new ErrorStatus(code, expectedStatus).toServiceError()

      assert.deepEqual(formatGrpcErrorStatus(serviceError), {
        status: expectedStatus,
        code,
        message: expectedStatus,
        details: [],
      })
    }
  })

  it('does not format unrelated errors', () => {
    assert.equal(formatGrpcErrorStatus(new Error('Test')), undefined)
  })
})

describe('formatGraphQLGrpcError', () => {
  it('places the formatted status in the established GraphQL exception extension', () => {
    const serviceError = new ErrorStatus(status.INVALID_ARGUMENT, 'Test').toServiceError()
    const formattedError = formatGraphQLGrpcError({
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

  it('leaves non-gRPC extensions unchanged', () => {
    const formattedError = formatGraphQLGrpcError({
      message: 'Test',
      extensions: {
        exception: new Error('Test'),
      },
    })

    assert.ok(formattedError.extensions?.exception instanceof Error)
  })
})
