import type { ServiceError } from '@grpc/grpc-js'

import assert                from 'node:assert/strict'
import { createRequire }     from 'node:module'
import { describe }          from 'node:test'
import { it }                from 'node:test'

import { Metadata }          from '@grpc/grpc-js'
import { status }            from '@grpc/grpc-js'

import { formatError }       from '../format.js'

type BinaryMessage = {
  serializeBinary: () => Uint8Array
}

type GoogleRpcAny = new () => {
  pack: (bytes: Uint8Array, typeName: string, typeNamePrefix?: string) => void
}

type GoogleRpcBadRequest = BinaryMessage & {
  addFieldViolations: (violation: BinaryMessage) => void
}

type GoogleRpcBadRequestConstructor = {
  FieldViolation: new () => BinaryMessage & {
    setDescription: (description: string) => void
    setField: (field: string) => void
  }
  new (): GoogleRpcBadRequest
}

type GoogleRpcStatus = BinaryMessage & {
  addDetails: (detail: InstanceType<GoogleRpcAny>) => void
  setCode: (code: number) => void
  setMessage: (message: string) => void
}

type GoogleRpcStatusConstructor = new () => GoogleRpcStatus

const require = createRequire(import.meta.url)
const grpcErrorStatusRequire = createRequire(
  require.resolve('@atls/grpc-error-status/package.json')
)
const { Any } = grpcErrorStatusRequire('google-protobuf/google/protobuf/any_pb') as {
  Any: GoogleRpcAny
}
const { BadRequest } = require('@atls/grpc-error-status/proto/google/rpc/error_details_pb.js') as {
  BadRequest: GoogleRpcBadRequestConstructor
}
const { Status } = require('@atls/grpc-error-status/proto/google/rpc/status_pb.js') as {
  Status: GoogleRpcStatusConstructor
}

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

  it('preserves gRPC status details', () => {
    const metadata = new Metadata()
    const violation = new BadRequest.FieldViolation()
    const badRequest = new BadRequest()
    const detail = new Any()
    const rpcStatus = new Status()

    violation.setField('id')
    violation.setDescription('id must be an email')
    badRequest.addFieldViolations(violation)
    detail.pack(badRequest.serializeBinary(), 'google.rpc.BadRequest')
    rpcStatus.setCode(status.INVALID_ARGUMENT)
    rpcStatus.setMessage('Request validation failed')
    rpcStatus.addDetails(detail)
    metadata.add('grpc-status-details-bin', Buffer.from(rpcStatus.serializeBinary()))

    const serviceError = Object.assign(new Error('3 INVALID_ARGUMENT: Request validation failed'), {
      code: status.INVALID_ARGUMENT,
      details: 'Request validation failed',
      metadata,
    }) as ServiceError

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
