import type { ApolloServer }    from '@apollo/server'
import type { MeshInstance }    from '@graphql-mesh/runtime'
import type { GraphQLSchema }   from 'graphql'
import type { IncomingMessage } from 'node:http'

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

export interface GatewaySubscriptionServer {
  dispose: () => Promise<void>
}
