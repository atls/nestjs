import { credentials }  from 'grpc'
import { Metadata }     from 'grpc'
import { ServiceError } from 'grpc'
import { Client }       from 'grpc'

export class ProtoClient {
  constructor(private readonly client: Client) {}

  static create(url: string = '0.0.0.0:50051', ServiceClient) {
    return new ProtoClient(new ServiceClient(url, credentials.createInsecure(), {}))
  }

  call(method: string, request, meta = {}) {
    const metadata = new Metadata()

    Object.keys(meta).forEach((key) => {
      if (meta[key]) {
        metadata.add(key, meta[key])
      }
    })

    return new Promise((resolve, reject) => {
      if (this.client[method].requestStream) {
        const call = this.client[method](metadata)

        call.write(request)

        let response

        call.on('data', (data) => {
          response = data

          call.end()
        })

        call.on('end', () => {
          resolve(response)
        })
      } else {
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
