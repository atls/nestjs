import type { OnModuleInit }      from '@nestjs/common'
import type { OnModuleDestroy }   from '@nestjs/common'

import { Inject }                 from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
import { HttpAdapterHost }        from '@nestjs/core'
import { ApolloServer }           from 'apollo-server-express'
// @ts-expect-error
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

  async onModuleInit(): Promise<void> {
    const { schema, contextBuilder, subscribe, execute } = await this.mesh.getInstance()

    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const app = this.adapterHost.httpAdapter.getInstance()

      const { path = '/', playground, introspection, cors } = this.options

      const apolloServer = new ApolloServer({
        schema,
        introspection: introspection === undefined ? Boolean(playground) : introspection,
        context: contextBuilder,
        playground,
        // @ts-expect-error
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      if (schema.getSubscriptionType()) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.wss = new Server({
          noServer: true,
          path,
        })

        // eslint-disable-next-line
        useServer(
          {
            schema,
            execute: (args) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
              execute(args.document, args.variableValues, args.contextValue, args.rootValue),
            subscribe: (args) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
              subscribe(args.document, args.variableValues, args.contextValue, args.rootValue),
            context: async ({ connectionParams = {}, extra: { request } }) => {
              for (const [key, value] of Object.entries(
                (connectionParams.headers ?? {}) as Record<string, unknown>
              )) {
                if (!(key.toLowerCase() in request.headers)) {
                  // @ts-expect-error
                  request.headers[key.toLowerCase()] = value
                }
              }

              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
              return contextBuilder(request)
            },
          },
          this.wss
        )

        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.adapterHost.httpAdapter.getHttpServer().on('upgrade', (req, socket, head) => {
          // @ts-expect-error
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          this.wss.handleUpgrade(req, socket, head, (ws) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.wss.emit('connection', ws, req)
          })
        })
      }
    } else {
      throw new Error('Only express engine available')
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.apolloServer?.stop()

    if (this.wss) {
      for (const client of this.wss.clients) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.close(1001, 'Going away')
      }
    }
  }
}
