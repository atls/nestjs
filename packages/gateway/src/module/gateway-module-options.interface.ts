import { ModuleMetadata, Type } from '@nestjs/common/interfaces'
import { PlaygroundConfig }     from 'apollo-server-express'
import { MeshPubSub }           from '@graphql-mesh/types'
import { KeyValueCache }        from '@graphql-mesh/types'
import { MeshMerger }           from '@graphql-mesh/types'
import { YamlConfig }           from '@graphql-mesh/types'

import { GatewaySourceType }    from '../enums'

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
  cors?: any | boolean
  pubsub?: MeshPubSub
  cache?: KeyValueCache
  merger?: MeshMerger
  sources?: SourceOptions[]
  transforms?: SourceTransformsOptions
  additionalTypeDefs?: any
  additionalResolvers?: (
    | string
    | YamlConfig.AdditionalStitchingResolverObject
    | YamlConfig.AdditionalStitchingBatchResolverObject
    | YamlConfig.AdditionalSubscriptionObject
  )[]
}

export interface GatewayOptionsFactory {
  createGatewayOptions(): Promise<GatewayModuleOptions> | GatewayModuleOptions
}

export interface GatewayModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GatewayOptionsFactory>
  useClass?: Type<GatewayOptionsFactory>
  useFactory?: (...args: any[]) => Promise<GatewayModuleOptions> | GatewayModuleOptions
  inject?: any[]
}
