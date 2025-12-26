import type { OnModuleInit }          from '@nestjs/common'
import type { OnModuleDestroy }       from '@nestjs/common'
import type { GraphQLError }          from 'graphql'
import type { GraphQLFormattedError } from 'graphql'
import type { GraphQLSchema }         from 'graphql'
import type { IncomingMessage }       from 'node:http'
import type { Socket }                from 'node:net'

import { Inject }                     from '@nestjs/common'
import { Injectable }                 from '@nestjs/common'
import { HttpAdapterHost }            from '@nestjs/core'
import { ApolloServer }               from 'apollo-server-express'
import { WebSocketServer }            from 'ws'
import { useServer }                  from 'graphql-ws/lib/use/ws'

import { GATEWAY_MODULE_OPTIONS }     from '../module/index.js'
import { GatewayModuleOptions }       from '../module/index.js'
import { GraphQLMesh }                from './graphql.mesh.js'
import { formatError }                from './format.error.js'

type ApolloCorsOption = Parameters<ApolloServer['applyMiddleware']>[0]['cors']

@Injectable()
export class GraphQLMeshHandler implements OnModuleInit, OnModuleDestroy {
  private apolloServer!: ApolloServer

  private wss?: WebSocketServer

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly mesh: GraphQLMesh,
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions
  ) {}

  async onModuleInit(): Promise<void> {
    const { schema, contextBuilder, subscribe, execute } = await this.mesh.getInstance()
    const meshSchema = schema as GraphQLSchema

    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const app = this.adapterHost.httpAdapter.getInstance()
      const buildContext = contextBuilder as (req: IncomingMessage) => unknown

      const { path = '/', playground, introspection, cors } = this.options
      const corsOptions = cors as ApolloCorsOption

      const apolloServer = new ApolloServer({
        schema,
        introspection: introspection === undefined ? Boolean(playground) : introspection,
        context: contextBuilder,
        playground,
        formatError: (error: GraphQLError): GraphQLFormattedError =>
          formatError(error as { extensions?: Record<string, unknown> }) as GraphQLFormattedError,
      })

      apolloServer.applyMiddleware({
        app,
        path,
        cors: corsOptions,
        bodyParserConfig: {
          limit: this.options.limit || undefined,
        },
      })

      this.apolloServer = apolloServer

      if (meshSchema.getSubscriptionType()) {
        this.wss = new WebSocketServer({
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
                  request.headers[key.toLowerCase()] = value as string
                }
              }

              return buildContext(request)
            },
          },
          this.wss
        )

        const httpServer = this.adapterHost.httpAdapter.getHttpServer() as {
          on: (
            event: 'upgrade',
            handler: (req: IncomingMessage, socket: Socket, head: Buffer) => void
          ) => void
        }
        httpServer.on('upgrade', (req, socket, head) => {
          this.wss?.handleUpgrade(req, socket, head, (ws) => {
            this.wss?.emit('connection', ws, req)
          })
        })
      }
    } else {
      throw new Error('Only express engine available')
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.apolloServer.stop()

    if (this.wss) {
      for (const client of this.wss.clients) {
        client.close(1001, 'Going away')
      }
    }
  }
}
