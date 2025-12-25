import type { ChannelCredentials } from '@grpc/grpc-js'
import type { Client }             from '@grpc/grpc-js'
import type { ServiceError }       from '@grpc/grpc-js'

import { Metadata }                from '@grpc/grpc-js'
import { credentials }             from '@grpc/grpc-js'

type ServiceClientConstructor = new (
  address: string,
  creds: ChannelCredentials,
  options: Record<string, unknown>
) => Client

type ClientStreamCall = {
  write: (data: unknown) => void
  on: (event: 'data' | 'end' | 'error', handler: (data?: unknown) => void) => void
  end: () => void
}

type ClientRequestStreamMethod = ((metadata: Metadata) => ClientStreamCall) & {
  requestStream: true
}

type ClientUnaryMethod = (
  request: unknown,
  metadata: Metadata,
  callback: (error: ServiceError | null, response: unknown) => void
) => void

type ClientMethod = ClientRequestStreamMethod | ClientUnaryMethod

const getClientMethod = (client: Client, method: string): ClientMethod => {
  const candidate = (client as unknown as Record<string, unknown>)[method]
  if (typeof candidate !== 'function') {
    throw new Error(`Unknown gRPC method: ${method}`)
  }
  return candidate as ClientMethod
}

export class ProtoClient {
  constructor(private readonly client: Client) {}

  static create(
    ServiceClient: ServiceClientConstructor,
    url: string = '0.0.0.0:50051'
  ): ProtoClient {
    return new ProtoClient(new ServiceClient(url, credentials.createInsecure(), {}))
  }

  async call(
    method: string,
    request: unknown,
    meta: Record<string, Buffer | string | null> = {}
  ): Promise<unknown> {
    const metadata = new Metadata()

    Object.keys(meta).forEach((key) => {
      const value = meta[key]
      if (typeof value === 'string' || value instanceof Buffer) {
        metadata.add(key, value)
      }
    })

    return new Promise((resolve, reject) => {
      const methodImpl = getClientMethod(this.client, method)
      if ('requestStream' in methodImpl) {
        const call = methodImpl(metadata)

        call.write(request)

        let response: unknown

        call.on('data', (data) => {
          response = data

          call.end()
        })

        call.on('end', () => {
          resolve(response)
        })
      } else {
        methodImpl(request as Metadata, metadata, (
          error: ServiceError | null,
          response: unknown
        ) => {
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        })
      }
    })
  }
}
