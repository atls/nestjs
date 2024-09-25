import type { GrpcObject }                from '@grpc/grpc-js'
import type { Client }                    from '@grpc/grpc-js'
import type { OnApplicationBootstrap }    from '@nestjs/common'

import { Inject }                         from '@nestjs/common'
import { Injectable }                     from '@nestjs/common'
import { loadPackageDefinition }          from '@grpc/grpc-js'
import { load }                           from '@grpc/proto-loader'
import get                                from 'lodash.get'

import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from '../module/index.js'
import { GrpcHttpProxyModuleOptions }     from '../module/index.js'
import { ProtoClient }                    from './proto.client.js'

@Injectable()
export class ProtoRegistry implements OnApplicationBootstrap {
  private definitions: Array<GrpcObject> = []

  constructor(
    @Inject(GRPC_HTTP_PROXY_MODULE_OPTIONS) private readonly options: GrpcHttpProxyModuleOptions
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const protoPaths = Array.isArray(this.options.options.protoPath)
      ? this.options.options.protoPath
      : [this.options.options.protoPath]

    this.definitions = await Promise.all(
      // @ts-expect-error
      protoPaths.map(async (protoPath: string) => {
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
