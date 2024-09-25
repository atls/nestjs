// @ts-expect-error
import type { MeshPubSub }        from '@graphql-mesh/types'
// @ts-expect-error
import type { KeyValueCache }     from '@graphql-mesh/types'
// @ts-expect-error
import type { MeshMerger }        from '@graphql-mesh/types'
// @ts-expect-error
import type { YamlConfig }        from '@graphql-mesh/types'
import type { ChannelOptions }    from '@grpc/grpc-js'
import type { ModuleMetadata }    from '@nestjs/common/interfaces'
import type { Type }              from '@nestjs/common/interfaces'
import type { PlaygroundConfig }  from 'apollo-server-express'

import type { GatewaySourceType } from '../enums/index.js'

export interface SourceTransformsOptions {
  rename?: YamlConfig.Transform['rename']
  encapsulate?: YamlConfig.Transform['encapsulate']
  prefix?: YamlConfig.Transform['prefix']
  cache?: YamlConfig.Transform['cache']
  snapshot?: YamlConfig.Transform['snapshot']
  mock?: YamlConfig.Transform['mock']
  resolversComposition?: YamlConfig.Transform['resolver-composition']
  namingConvention?: YamlConfig.Transform['naming-convention']
  filterSchema?: YamlConfig.Transform['filter-schema']
}

export interface SourceOptions {
  name: string
  type: GatewaySourceType
  handler: YamlConfig.GrpcHandler
  transforms?: SourceTransformsOptions
}

export interface GatewayModuleOptions {
  path?: string
  playground?: PlaygroundConfig
  introspection?: boolean
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  cors?: any | boolean
  pubsub?: MeshPubSub
  cache?: KeyValueCache
  merger?: MeshMerger
  sources?: Array<SourceOptions>
  transforms?: SourceTransformsOptions
  additionalTypeDefs?: any
  limit?: number | string
  grpcChannelOptions?: Partial<ChannelOptions>
  additionalResolvers?: Array<
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | YamlConfig.AdditionalStitchingBatchResolverObject
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | YamlConfig.AdditionalStitchingResolverObject
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    | YamlConfig.AdditionalSubscriptionObject
    | string
  >
}

export interface GatewayOptionsFactory {
  createGatewayOptions: () => GatewayModuleOptions | Promise<GatewayModuleOptions>
}

export interface GatewayModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GatewayOptionsFactory>
  useClass?: Type<GatewayOptionsFactory>
  useFactory?: (...args: Array<any>) => GatewayModuleOptions | Promise<GatewayModuleOptions>
  inject?: Array<any>
}
