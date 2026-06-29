import type { GraphQLFormattedError }            from 'graphql'
import type { GraphQLSchema }                    from 'graphql'
import type { IncomingMessage }                  from 'node:http'
import type { Socket }                           from 'node:net'

import type { GatewayModuleOptions }             from '../module/index.js'
import type { GraphQLMesh }                      from './graphql.mesh.js'
import type { GatewayGraphQLRuntime }            from './interfaces.js'
import type { GatewayHttpServer }                from './interfaces.js'

import { ApolloServer }                          from '@apollo/server'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { Injectable }                            from '@nestjs/common'
import { unwrapResolverError }                   from '@apollo/server/errors'
import { WebSocketServer }                       from 'ws'
import { useServer }                             from 'graphql-ws/lib/use/ws'

import { formatError }                           from './errors/format.js'

type GraphQLWsServerOptions = Parameters<typeof useServer>[0]

@Injectable()
export class GraphQLMeshRuntime {
  async create(mesh: GraphQLMesh, options: GatewayModuleOptions): Promise<GatewayGraphQLRuntime> {
    const meshInstance = await mesh.getInstance()
    const schema = meshInstance.schema as GraphQLSchema
    const apolloServer = new ApolloServer<Record<string, unknown>>({
      schema,
      introspection:
        options.introspection === undefined ? Boolean(options.playground) : options.introspection,
      plugins: [ApolloServerPluginLandingPageDisabled()],
      allowBatchedHttpRequests: true,
      csrfPrevention: false,
      formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError =>
        formatError(formattedError, unwrapResolverError(error)),
    })

    await apolloServer.start()

    return {
      mesh: meshInstance,
      schema,
      contextBuilder: meshInstance.contextBuilder,
      apolloServer,
    } as GatewayGraphQLRuntime
  }

  registerSubscriptions(
    runtime: GatewayGraphQLRuntime,
    server: GatewayHttpServer,
    path: string
  ): WebSocketServer | undefined {
    if (!runtime.schema.getSubscriptionType()) {
      return undefined
    }

    const webSocketServer = new WebSocketServer({
      noServer: true,
      path,
    })

    // eslint-disable-next-line
    useServer(
      {
        schema: runtime.schema as unknown as GraphQLWsServerOptions['schema'],
        execute: (args) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          runtime.mesh.execute(
            args.document,
            args.variableValues,
            args.contextValue,
            args.rootValue
          ),
        subscribe: (args) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          runtime.mesh.subscribe(
            args.document,
            args.variableValues,
            args.contextValue,
            args.rootValue
          ),
        context: async ({ connectionParams = {}, extra: { request } }) => {
          this.applyConnectionHeaders(request, connectionParams.headers)

          return runtime.contextBuilder(request)
        },
      },
      webSocketServer
    )

    server.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
      webSocketServer.handleUpgrade(req, socket, head, (ws) => {
        webSocketServer.emit('connection', ws, req)
      })
    })

    return webSocketServer
  }

  private applyConnectionHeaders(request: IncomingMessage, headers: unknown): void {
    for (const [key, value] of Object.entries((headers ?? {}) as Record<string, unknown>)) {
      if (!(key.toLowerCase() in request.headers)) {
        request.headers[key.toLowerCase()] = value as string
      }
    }
  }
}
