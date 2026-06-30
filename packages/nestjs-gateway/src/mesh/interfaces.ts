import type { ApolloServer }         from '@apollo/server'
import type { MeshInstance }         from '@graphql-mesh/runtime'
import type { GraphQLSchema }        from 'graphql'
import type { IncomingMessage }      from 'node:http'
import type { Socket }               from 'node:net'

import type { GatewayModuleOptions } from '../module/gateway-module-options.interface.js'

export type GatewayContext = Record<string, unknown>

export type GatewayRequestContext =
  | IncomingMessage
  | {
      req: IncomingMessage
      res?: unknown
    }

export type GatewayContextBuilder = (context: GatewayRequestContext) => Promise<GatewayContext>

export interface GatewayGraphQLRuntime {
  mesh: MeshInstance
  schema: GraphQLSchema
  contextBuilder: GatewayContextBuilder
  apolloServer: ApolloServer<GatewayContext>
}

export interface GatewayHttpServer {
  on: (
    event: 'upgrade',
    handler: (req: IncomingMessage, socket: Socket, head: Buffer) => void
  ) => void
}

export interface GatewayHttpBoundary {
  register: (runtime: GatewayGraphQLRuntime, options: GatewayModuleOptions) => Promise<void>
}
