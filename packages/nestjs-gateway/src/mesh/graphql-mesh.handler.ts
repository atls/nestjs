import type { OnModuleDestroy }               from '@nestjs/common'
import type { OnModuleInit }                  from '@nestjs/common'
import type { WebSocketServer }               from 'ws'

import type { GatewayModuleOptions }          from '../module/interfaces.js'
import type { GatewayHttpBoundary }           from './http/interfaces.js'
import type { GatewayHttpServer }             from './http/interfaces.js'
import type { GatewayGraphQLRuntime }         from './interfaces.js'

import { Inject }                             from '@nestjs/common'
import { Injectable }                         from '@nestjs/common'
import { HttpAdapterHost }                    from '@nestjs/core'

import { GATEWAY_MODULE_OPTIONS }             from '../module/gateway.constants.js'
import { GatewayUnsupportedHttpAdapterError } from './errors/unsupported.js'
import { GraphQLMesh }                        from './graphql.mesh.js'
import { ExpressGraphQLGateway }              from './http/express.gateway.js'
import { FastifyGraphQLGateway }              from './http/fastify.gateway.js'
import { GraphQLMeshRuntime }                 from './runtime.js'

@Injectable()
export class GraphQLMeshHandler implements OnModuleInit, OnModuleDestroy {
  private runtime?: GatewayGraphQLRuntime

  private webSocketServer?: WebSocketServer

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly mesh: GraphQLMesh,
    private readonly meshRuntime: GraphQLMeshRuntime,
    private readonly expressGateway: ExpressGraphQLGateway,
    private readonly fastifyGateway: FastifyGraphQLGateway,
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions
  ) {}

  async onModuleInit(): Promise<void> {
    const gateway = this.getHttpGateway()
    const runtime = await this.meshRuntime.create(this.mesh, this.options)

    try {
      await gateway.register(runtime, this.options)
    } catch (error) {
      await runtime.apolloServer.stop()
      throw error
    }

    this.runtime = runtime
    this.webSocketServer = this.meshRuntime.registerSubscriptions(
      runtime,
      this.adapterHost.httpAdapter.getHttpServer() as GatewayHttpServer,
      this.options.path || '/'
    )
  }

  async onModuleDestroy(): Promise<void> {
    await this.runtime?.apolloServer.stop()

    if (this.webSocketServer) {
      for (const client of this.webSocketServer.clients) {
        client.close(1001, 'Going away')
      }
    }
  }

  private getHttpGateway(): GatewayHttpBoundary {
    const adapter = this.adapterHost.httpAdapter.getType()

    if (adapter === 'express') {
      return this.expressGateway
    }

    if (adapter === 'fastify') {
      return this.fastifyGateway
    }

    throw new GatewayUnsupportedHttpAdapterError(adapter)
  }
}
