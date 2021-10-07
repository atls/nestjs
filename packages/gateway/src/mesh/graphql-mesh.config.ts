/* eslint-disable no-else-return */

import { Inject }                      from '@nestjs/common'
import { Injectable }                  from '@nestjs/common'
import InMemoryLRUCache                from '@graphql-mesh/cache-inmemory-lru'
import StitchingMerger                 from '@graphql-mesh/merger-stitching'
import RenameTransform                 from '@graphql-mesh/transform-rename'
import EncapsulateTransform            from '@graphql-mesh/transform-encapsulate'
import PrefixTransform                 from '@graphql-mesh/transform-prefix'
import CacheTransform                  from '@graphql-mesh/transform-cache'
import SnapshotTransform               from '@graphql-mesh/transform-snapshot'
import MockingTransform                from '@graphql-mesh/transform-mock'
import ResolversCompositionTransform   from '@graphql-mesh/transform-resolvers-composition'
import NamingConventionTransform       from '@graphql-mesh/transform-naming-convention'
import FilterTransform                 from '@graphql-mesh/transform-filter-schema'
import { InMemoryStoreStorageAdapter } from '@graphql-mesh/store'
import { MeshStore }                   from '@graphql-mesh/store'
import { GetMeshOptions }              from '@graphql-mesh/runtime'
import { MeshTransform }               from '@graphql-mesh/types'
import { getDefaultSyncImport }        from '@graphql-mesh/utils'
import { resolveAdditionalResolvers }  from '@graphql-mesh/utils'
import { resolveAdditionalTypeDefs }   from '@graphql-mesh/config'
import { PubSub }                      from 'graphql-subscriptions'
import { join }                        from 'path'

import { GATEWAY_MODULE_OPTIONS }      from '../module'
import { GatewayModuleOptions }        from '../module'
import { SourceOptions }               from '../module'
import { SourceTransformsOptions }     from '../module'
import { GatewaySourceType }           from '../enums'
import { GraphQLMeshLogger }           from './graphql-mesh.logger'
import GrpcHandler                     from './handlers/grpc/grpc.handler'

@Injectable()
export class GraphQLMeshConfig {
  private syncImportFn

  private cache

  private merger

  private store

  private baseDir

  private transforms: MeshTransform[]

  private logger: GraphQLMeshLogger

  constructor(
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions,
    private readonly pubsub: PubSub
  ) {
    this.logger = new GraphQLMeshLogger('Mesh')
    this.baseDir = process.cwd()
    this.cache = options.cache || new InMemoryLRUCache()
    this.store = new MeshStore(join(process.cwd(), '.mesh'), new InMemoryStoreStorageAdapter(), {
      readonly: false,
      validate: false,
    })

    this.syncImportFn = getDefaultSyncImport(this.baseDir)
    this.transforms = this.createTransforms('root', options.transforms)

    this.merger =
      options.merger ||
      new StitchingMerger({
        cache: this.cache,
        pubsub: this.pubsub,
        store: this.store.child(`StitchingMerger`),
        logger: this.logger,
      })
  }

  async create(): Promise<GetMeshOptions> {
    const additionalTypeDefs = await resolveAdditionalTypeDefs(
      this.baseDir,
      this.options.additionalTypeDefs
    )
    const additionalResolvers = await resolveAdditionalResolvers(
      this.baseDir,
      this.options.additionalResolvers || [],
      this.syncImportFn,
      this.pubsub
    )

    return {
      sources: this.createSources(),
      cache: this.cache,
      pubsub: this.pubsub,
      merger: this.merger,
      transforms: this.transforms,
      additionalTypeDefs,
      additionalResolvers,
    }
  }

  protected createSources() {
    return (this.options.sources || []).map((source) => ({
      name: source.name,
      handler: this.createHandler(source),
      transforms: this.createTransforms(source.name, source.transforms),
    }))
  }

  protected createHandler(source: SourceOptions) {
    if (source.type === GatewaySourceType.GRPC) {
      return new GrpcHandler({
        name: source.name,
        config: source.handler,
        cache: this.cache,
        pubsub: this.pubsub,
        store: this.store,
        baseDir: this.baseDir,
        logger: this.logger,
        // @ts-ignore
        importFn: null,
      })
    } else {
      throw new Error(`Unknown source type: ${source.type}`)
    }
  }

  protected createTransforms(apiName: string, config: SourceTransformsOptions = {}) {
    const transforms: any[] = []

    if (config.rename) {
      transforms.push(
        new RenameTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.rename,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.filterSchema) {
      transforms.push(
        FilterTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.filterSchema,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.encapsulate) {
      transforms.push(
        new EncapsulateTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.encapsulate,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.prefix) {
      transforms.push(
        new PrefixTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.prefix,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.cache) {
      transforms.push(
        new CacheTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.cache,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.snapshot) {
      transforms.push(
        new SnapshotTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.snapshot,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.mock) {
      transforms.push(
        new MockingTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.mock,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.resolversComposition) {
      transforms.push(
        new ResolversCompositionTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.resolversComposition,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    if (config.namingConvention) {
      transforms.push(
        new NamingConventionTransform({
          apiName,
          syncImportFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.namingConvention,
          cache: this.cache,
          pubsub: this.pubsub,
        })
      )
    }

    return transforms
  }
}
