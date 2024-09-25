import type { ServiceError } from '@grpc/grpc-js'
import type { Client }       from '@grpc/grpc-js'

// @ts-nocheck
import { Metadata }          from '@grpc/grpc-js'
import { credentials }       from '@grpc/grpc-js'

export class ProtoClient {
  constructor(private readonly client: Client) {}

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/default-param-last, @typescript-eslint/explicit-module-boundary-types
  static create(url: string = '0.0.0.0:50051', ServiceClient): ProtoClient {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    return new ProtoClient(new ServiceClient(url, credentials.createInsecure(), {}))
  }

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  async call(method: string, request, meta = {}) {
    const metadata = new Metadata()

    Object.keys(meta).forEach((key) => {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (meta[key]) metadata.add(key, meta[key])
    })

    return new Promise((resolve, reject) => {
      // @ts-expect-error
      if (this.client[method].requestStream) {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const call = this.client[method](metadata)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        call.write(request)

        // @ts-expect-error
        let response

        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        call.on('data', (data) => {
          response = data

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          call.end()
        })

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        call.on('end', () => {
          // @ts-expect-error
          resolve(response)
        })
      } else {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.client[method](request, metadata, (error: ServiceError, response) => {
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
