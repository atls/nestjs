import type { OnModuleInit }          from '@nestjs/common'
import type { OnModuleDestroy }       from '@nestjs/common'
import type { CorsOptions }           from 'cors'
import type { Express }               from 'express'
import type { GraphQLFormattedError } from 'graphql'
import type { GraphQLSchema }         from 'graphql'
import type { IncomingMessage }       from 'node:http'
import type { Socket }                from 'node:net'

import { ApolloServer }               from '@apollo/server'
import { Inject }                     from '@nestjs/common'
import { Injectable }                 from '@nestjs/common'
import { HttpAdapterHost }            from '@nestjs/core'
import { expressMiddleware }          from '@as-integrations/express4'
import { WebSocketServer }            from 'ws'
import { json }                       from 'express'
import { useServer }                  from 'graphql-ws/lib/use/ws'
import corsMiddleware                 from 'cors'

import { GATEWAY_MODULE_OPTIONS }     from '../module/index.js'
import { GatewayModuleOptions }       from '../module/index.js'
import { GraphQLMesh }                from './graphql.mesh.js'
import { formatError }                from './format.error.js'

@Injectable()
export class GraphQLMeshHandler implements OnModuleInit, OnModuleDestroy {
  private apolloServer?: ApolloServer<Record<string, unknown>>

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
      const app = this.adapterHost.httpAdapter.getInstance<Express>()
      const buildContext = contextBuilder as (
        req: IncomingMessage
      ) => Promise<Record<string, unknown>>

      const { path = '/', playground, introspection, cors } = this.options

      const apolloServer = new ApolloServer<Record<string, unknown>>({
        schema: meshSchema,
        introspection: introspection === undefined ? Boolean(playground) : introspection,
        formatError: (
          _formattedError: GraphQLFormattedError,
          error: unknown
        ): GraphQLFormattedError =>
          formatError(error as { extensions?: Record<string, unknown> }) as GraphQLFormattedError,
      })

      await apolloServer.start()

      const middleware = [
        ...(cors === false
          ? []
          : [corsMiddleware(cors === true ? undefined : (cors as CorsOptions))]),
        json({
          limit: this.options.limit || undefined,
        }),
        expressMiddleware(apolloServer, {
          context: async ({ req }) => buildContext(req),
        }),
      ]

      app.use(path, ...middleware)

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
    await this.apolloServer?.stop()

    if (this.wss) {
      for (const client of this.wss.clients) {
        client.close(1001, 'Going away')
      }
    }
  }
}
