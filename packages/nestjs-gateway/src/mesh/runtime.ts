import type { GraphQLFormattedError }            from 'graphql'
import type { IncomingMessage }                  from 'node:http'
import type { Socket }                           from 'node:net'

import type { GatewayModuleOptions } from '../module/gateway-module-options.interface.js'
import type { GraphQLMesh }                      from './graphql.mesh.js'
import type { GatewayContextBuilder }            from './interfaces.js'
import type { GatewayGraphQLRuntime }            from './interfaces.js'
import type { GatewayHttpServer }                from './interfaces.js'

import { ApolloServer }                          from '@apollo/server'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { Injectable }                            from '@nestjs/common'
import { unwrapResolverError }                   from '@apollo/server/errors'
import { WebSocketServer }                       from 'ws'
import { useServer }                             from 'graphql-ws/lib/use/ws'

import { formatError }                           from './errors/format.js'

type GraphQLWsServerOptions = Parameters<typeof useServer>[0]
type LandingPageOptions = Parameters<typeof ApolloServerPluginLandingPageLocalDefault>[0]

const createLandingPagePlugin = ({ playground }: GatewayModuleOptions) => {
  if (!playground) {
    return ApolloServerPluginLandingPageDisabled()
  }

  if (typeof playground === 'boolean') {
    return ApolloServerPluginLandingPageLocalDefault()
  }

  return ApolloServerPluginLandingPageLocalDefault(playground as LandingPageOptions)
}

@Injectable()
export class GraphQLMeshRuntime {
  async create(mesh: GraphQLMesh, options: GatewayModuleOptions): Promise<GatewayGraphQLRuntime> {
    const meshInstance = await mesh.getInstance()
    const { schema } = meshInstance
    const apolloServer = new ApolloServer<Record<string, unknown>>({
      schema,
      introspection:
        options.introspection === undefined ? Boolean(options.playground) : options.introspection,
      plugins: [createLandingPagePlugin(options)],
      allowBatchedHttpRequests: true,
      csrfPrevention: false,
      formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError =>
        formatError(formattedError, unwrapResolverError(error)),
    })

    await apolloServer.start()

    return {
      mesh: meshInstance,
      schema,
      contextBuilder: (async (context) =>
        meshInstance.getEnveloped(context).contextFactory(context)) satisfies GatewayContextBuilder,
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
        execute: async (args) =>
          runtime.mesh.execute(
            args.document,
            args.variableValues,
            args.contextValue,
            args.rootValue
          ),
        subscribe: async (args) =>
          runtime.mesh.subscribe(
            args.document,
            args.variableValues,
            args.contextValue,
            args.rootValue
          ),
        context: async ({ connectionParams = {}, extra: { request } }) => {
          this.applyConnectionHeaders(request, connectionParams.headers)

          return runtime.contextBuilder({ req: request })
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
