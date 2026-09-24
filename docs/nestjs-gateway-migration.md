# Migrating from @atls/nestjs-gateway

`@atls/nestjs-gateway` is retired. New integrations should use [Mesh v1 Compose](https://the-guild.dev/graphql/mesh/v1/getting-started) to build a supergraph SDL file and the [official Hive Nest driver](https://the-guild.dev/graphql/hive/docs/gateway/deployment/node-frameworks/nestjs) to serve it. There is no replacement ATLS gateway module. Published versions of the old package remain installable for applications that have not migrated.

The two phases have different owners. Compose reads source definitions and writes `supergraph.graphql` during the build. The running Nest application reads that artifact; it must not rebuild the schema from `.proto` files at startup. Ship the SDL alongside the compiled application and resolve its path relative to the module that loads it, not an assumed working directory.

## Direct integration

Install `@graphql-mesh/compose-cli` and `@omnigraph/grpc` for the composition step. Install `@nestjs/graphql`, `@graphql-hive/nestjs`, `@graphql-hive/gateway`, `@graphql-mesh/transport-grpc`, and `graphql` for the application. Select a mutually compatible Nest, GraphQL, and Hive version set from their published peer dependencies. The maintained driver supports Nest's Express and Fastify adapters; it owns HTTP registration, subscriptions, and gateway disposal.

Define a build-time `mesh.config.ts`:

```ts
import { defineConfig }     from '@graphql-mesh/compose-cli'
import { loadGrpcSubgraph } from '@omnigraph/grpc'

export const composeConfig = defineConfig({
  subgraphs: [
    {
      sourceHandler: loadGrpcSubgraph('Files', {
        endpoint: 'localhost:50051',
        source: {
          file: './proto/files.proto',
          load: { includeDirs: ['./proto'], defaults: true },
        },
        metaData: {
          authorization: ['req', 'headers', 'authorization'],
        },
        requestTimeout: 60_000,
      }),
    },
  ],
})
```

Run `mesh-compose -c ./mesh.config.ts -o ./supergraph.graphql` in the build. The exact generated field and type names are part of the consumer's schema contract; inspect the SDL before selecting v1 transforms.

Serve the artifact through Nest's `GraphQLModule`. The import path below assumes the build copies `supergraph.graphql` next to the compiled module:

```ts
import { readFileSync }            from 'node:fs'

import { HiveGatewayDriver }       from '@graphql-hive/nestjs'
import { HiveGatewayDriverConfig } from '@graphql-hive/nestjs'
import { Module }                  from '@nestjs/common'
import { GraphQLModule }           from '@nestjs/graphql'

@Module({
  imports: [
    GraphQLModule.forRoot<HiveGatewayDriverConfig>({
      driver: HiveGatewayDriver,
      supergraph: readFileSync(new URL('./supergraph.graphql', import.meta.url), 'utf8'),
      path: '/graphql',
      transports: { grpc: import('@graphql-mesh/transport-grpc') },
      transportEntries: {
        Files: {
          kind: 'grpc',
          location: process.env.FILES_SERVICE_URL ?? 'localhost:50051',
        },
      },
      subscriptions: { 'graphql-ws': true },
    }),
  ],
})
export class AppModule {}
```

Use `GraphQLModule.forRootAsync` when Nest providers supply runtime options. This is not a drop-in replacement for `GatewayModule.registerAsync`: source loading belongs to Compose and the returned options must be `HiveGatewayDriverConfig`. See the [Mesh v0 migration guide](https://the-guild.dev/graphql/mesh/v1/migration-from-v0) for the split between build-time and runtime configuration.

## Option migration

| Former gateway option                                                            | New owner and migration                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sources[].handler.protoFilePath`                                                | Compose `loadGrpcSubgraph(name, { source })`; keep proto include directories explicit                                                                                                                                           |
| `sources[].handler.endpoint`, `metaData`, `requestTimeout`, `grpcChannelOptions` | Configure the gRPC subgraph. Use `channelOptions` per subgraph. Override deployment-specific locations through Hive `transportEntries` when needed. `requestTimeout` sets a per-call gRPC deadline, not HTTP-abort cancellation |
| Source `rename`, `prefix`, `namingConvention`, `filterSchema`, `encapsulate`     | Use the corresponding v1 `create*Transform` in `subgraphs[].transforms`; compare the emitted SDL. v1 has no `bare` mode                                                                                                         |
| Root `transforms` and `merger`                                                   | No automatic translation. Move applicable transforms to a subgraph or express cross-subgraph behavior with Federation; do not recreate Mesh v0 stitching in Nest                                                                |
| `cache`, `mock`, `snapshot`, `resolversComposition`                              | No one-to-one option mapping. Re-evaluate each use against Hive plugins, test fixtures, or runtime resolvers before migration                                                                                                   |
| `additionalTypeDefs`, `additionalResolvers`                                      | Put type definitions in Compose and runtime resolvers in Hive configuration or the Nest driver options                                                                                                                          |
| `pubsub`, `GATEWAY_MESH_PUBSUB`, subscription resolvers                          | Configure Hive/Nest subscriptions and their pubsub explicitly. The removed ATLS injection token is not exported by the vendor driver                                                                                            |
| `path`, `cors`, `introspection`, `playground`, `limit`, `uploads`                | Configure the relevant Nest/Hive HTTP options and verify each observable behavior. Hive serves GraphiQL rather than Apollo Playground; Apollo-specific playground settings are not carried over automatically                   |

The old Apollo `formatError` integration is also removed. Hive may represent and mask downstream errors differently. Preserve a required client error shape through a focused Hive plugin and contract test, not a copied gRPC transport. `@atls/nestjs-gateway-errors` remains an independent package; its existing public functions are not removed by this migration.

Validate the generated schema and actual GraphQL operations, request metadata, error extensions, HTTP settings, WebSocket subscriptions, and shutdown against each application's contract. The vendor gRPC transport enforces a deadline when configured, but its unary calls are not proven to cancel on an HTTP abort; do not infer cancellation from a timeout or from Hive's HTTP upstream-cancellation option.
