import { Inject }                 from '@nestjs/common'
import { OnModuleInit }           from '@nestjs/common'
import { OnModuleDestroy }        from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
import { HttpAdapterHost }        from '@nestjs/core'
import { ApolloServer }           from 'apollo-server-express'
// @ts-ignore
import { Server }                 from 'ws'
import { useServer }              from 'graphql-ws/lib/use/ws'

import { GATEWAY_MODULE_OPTIONS } from '../module/index.js'
import { GatewayModuleOptions }   from '../module/index.js'
import { GraphQLMesh }            from './graphql.mesh.js'
import { formatError }            from './format.error.js'

@Injectable()
export class GraphQLMeshHandler implements OnModuleInit, OnModuleDestroy {
  private apolloServer!: ApolloServer

  private wss?: Server

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly mesh: GraphQLMesh,
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions
  ) {}

  async onModuleInit() {
    const { schema, contextBuilder, subscribe, execute } = await this.mesh.getInstance()

    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const app = this.adapterHost.httpAdapter.getInstance()

      const { path = '/', playground, introspection, cors } = this.options

      const apolloServer = new ApolloServer({
        schema,
        introspection: introspection === undefined ? Boolean(playground) : introspection,
        context: contextBuilder,
        playground,
        // @ts-ignore
        formatError,
      })

      apolloServer.applyMiddleware({
        app,
        path,
        cors,
        bodyParserConfig: {
          limit: this.options.limit || undefined,
        },
      })

      this.apolloServer = apolloServer

      if (schema.getSubscriptionType()) {
        this.wss = new Server({
          noServer: true,
          path,
        })

        // eslint-disable-next-line
        useServer(
          {
            schema,
            execute: (args) =>
              execute(args.document, args.variableValues, args.contextValue, args.rootValue),
            subscribe: (args) =>
              subscribe(args.document, args.variableValues, args.contextValue, args.rootValue),
            context: async ({ connectionParams = {}, extra: { request } }) => {
              for (const [key, value] of Object.entries(
                (connectionParams.headers ?? {}) as { [s: string]: unknown }
              )) {
                if (!(key.toLowerCase() in request.headers)) {
                  // @ts-ignore
                  request.headers[key.toLowerCase()] = value
                }
              }

              return contextBuilder(request)
            },
          },
          this.wss
        )

        // @ts-ignore
        this.adapterHost.httpAdapter.getHttpServer().on('upgrade', (req, socket, head) => {
          // @ts-ignore
          this.wss.handleUpgrade(req, socket, head, (ws) => {
            this.wss.emit('connection', ws, req)
          })
        })
      }
    } else {
      throw new Error('Only express engine available')
    }
  }

  async onModuleDestroy() {
    await this.apolloServer?.stop()

    if (this.wss) {
      for (const client of this.wss.clients) {
        client.close(1001, 'Going away')
      }
    }
  }
}
