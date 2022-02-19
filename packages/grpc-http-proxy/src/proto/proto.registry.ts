import { GrpcObject }                     from '@grpc/grpc-js'
import { Client }                         from '@grpc/grpc-js'
import { OnApplicationBootstrap }         from '@nestjs/common'
import { Inject }                         from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
import { loadPackageDefinition }          from '@grpc/grpc-js'
import { load }                           from '@grpc/proto-loader'

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
    const client = this.definitions.reduce((
      serviceClient: typeof Client | undefined,
      definition: GrpcObject
    ): typeof Client | undefined => {
      if (serviceClient) {
        return serviceClient
      }

      return get(definition, serviceName) as typeof Client
    }, undefined)

    if (!client) {
      throw new Error('GRPC service not found')
    }

    return ProtoClient.create(this.options.options.url, client)
  }
}
