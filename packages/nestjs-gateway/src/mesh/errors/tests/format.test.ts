import type { ServiceError } from '@grpc/grpc-js'

import assert                from 'node:assert/strict'
import { describe }          from 'node:test'
import { it }                from 'node:test'

import { Metadata }          from '@grpc/grpc-js'
import { status }            from '@grpc/grpc-js'

import { formatError }       from '../format.js'

describe('formatError', () => {
  it('formats direct gRPC service errors', () => {
    const serviceError = Object.assign(new Error('3 INVALID_ARGUMENT: Test'), {
      code: status.INVALID_ARGUMENT,
      details: 'Test',
      metadata: new Metadata(),
    }) as ServiceError

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
