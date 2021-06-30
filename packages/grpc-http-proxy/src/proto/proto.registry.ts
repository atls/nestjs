import { OnApplicationBootstrap }         from '@nestjs/common'
import { Injectable, Inject }             from '@nestjs/common'
import { load }                           from '@grpc/proto-loader'
import { loadPackageDefinition }          from 'grpc'
import { GrpcObject }                     from 'grpc'
import { Client }                         from 'grpc'
import get                                from 'lodash.get'

import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from '../module'
import { GrpcHttpProxyModuleOptions }     from '../module'
import { ProtoClient }                    from './proto.client'

@Injectable()
export class ProtoRegistry implements OnApplicationBootstrap {
  private definitions: GrpcObject[] = []

  constructor(
    @Inject(GRPC_HTTP_PROXY_MODULE_OPTIONS) private readonly options: GrpcHttpProxyModuleOptions
  ) {}

  async onApplicationBootstrap() {
    const protoPaths = Array.isArray(this.options.options.protoPath)
      ? this.options.options.protoPath
      : [this.options.options.protoPath]

    this.definitions = await Promise.all(
      protoPaths.map(async (protoPath) => {
        const packageDefinition = await load(protoPath, this.options.options.loader)

        return loadPackageDefinition(packageDefinition)
      })
    )
  }

  getClient(serviceName: string): ProtoClient {
    const client = this.definitions.reduce(
      (
        serviceClient: typeof Client | undefined,
        definition: GrpcObject
      ): typeof Client | undefined => {
        if (serviceClient) {
          return serviceClient
        }

        return get(definition, serviceName) as typeof Client
      },
      undefined
    )

    if (!client) {
      throw new Error('GRPC service not found')
    }

    return ProtoClient.create(this.options.options.url, client)
  }
}
