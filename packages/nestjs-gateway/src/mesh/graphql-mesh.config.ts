/* eslint-disable no-else-return */

// @ts-expect-error
import type { GetMeshOptions }          from '@graphql-mesh/runtime'
import type { MeshTransform }           from '@graphql-mesh/types'
import type { MeshPubSub }              from '@graphql-mesh/types'
import type { ImportFn }                from '@graphql-mesh/types'

import type { SourceOptions }           from '../module/index.js'
import type { SourceTransformsOptions } from '../module/index.js'

import { InMemoryStoreStorageAdapter }  from '@graphql-mesh/store'
import { MeshStore }                    from '@graphql-mesh/store'
import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'
// @ts-expect-error
import { resolveAdditionalTypeDefs }    from '@graphql-mesh/config'
// @ts-expect-error
import { getDefaultSyncImport }         from '@graphql-mesh/utils'
import { resolveAdditionalResolvers }   from '@graphql-mesh/utils'
// @ts-expect-error
import InMemoryLRUCache                 from '@graphql-mesh/cache-inmemory-lru'
import StitchingMerger                  from '@graphql-mesh/merger-stitching'
import CacheTransform                   from '@graphql-mesh/transform-cache'
import EncapsulateTransform             from '@graphql-mesh/transform-encapsulate'
import FilterTransform                  from '@graphql-mesh/transform-filter-schema'
// @ts-expect-error
import MockingTransform                 from '@graphql-mesh/transform-mock'
import NamingConventionTransform        from '@graphql-mesh/transform-naming-convention'
import PrefixTransform                  from '@graphql-mesh/transform-prefix'
import RenameTransform                  from '@graphql-mesh/transform-rename'
import ResolversCompositionTransform    from '@graphql-mesh/transform-resolvers-composition'
// @ts-expect-error
import SnapshotTransform                from '@graphql-mesh/transform-snapshot'
import { PubSub }                       from 'graphql-subscriptions'
import { join }                         from 'path'

import { GatewaySourceType }            from '../enums/index.js'
import { GATEWAY_MODULE_OPTIONS }       from '../module/index.js'
import { GatewayModuleOptions }         from '../module/index.js'
import { GraphQLMeshLogger }            from './graphql-mesh.logger.js'
import GrpcHandler                      from './handlers/grpc/grpc.handler.js'

@Injectable()
export class GraphQLMeshConfig {
  private syncImportFn

  private cache

  private merger

  private store

  private baseDir

  private transforms: Array<MeshTransform>

  private logger: GraphQLMeshLogger

  constructor(
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions,
    private readonly pubsub: PubSub
  ) {
    this.logger = new GraphQLMeshLogger('Mesh')
    this.baseDir = process.cwd()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.cache = options.cache || new InMemoryLRUCache()
    this.store = new MeshStore(join(process.cwd(), '.mesh'), new InMemoryStoreStorageAdapter(), {
      readonly: false,
      validate: false,
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.syncImportFn = getDefaultSyncImport(this.baseDir)
    this.transforms = this.createTransforms('root', options.transforms)

    this.merger =
      options.merger ||
      new StitchingMerger({
        cache: this.cache,
        pubsub: this.pubsub as unknown as MeshPubSub,
        store: this.store.child(`StitchingMerger`),
        logger: this.logger,
      })
  }

  async create(): Promise<GetMeshOptions> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const additionalTypeDefs = await resolveAdditionalTypeDefs(
      this.baseDir,
      this.options.additionalTypeDefs
    )
    const additionalResolvers = await resolveAdditionalResolvers(
      this.baseDir,
      this.options.additionalResolvers || [],
      this.syncImportFn as ImportFn,
      this.pubsub as unknown as MeshPubSub
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  protected createSources() {
    return (this.options.sources || []).map((source) => ({
      name: source.name,
      handler: this.createHandler(source),
      transforms: this.createTransforms(source.name, source.transforms),
    }))
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  protected createHandler(source: SourceOptions) {
    if (source.type === GatewaySourceType.GRPC) {
      return new GrpcHandler({
        // @ts-expect-error
        name: source.name,
        config: source.handler,
        cache: this.cache,
        pubsub: this.pubsub,
        store: this.store,
        baseDir: this.baseDir,
        logger: this.logger,
        importFn: null,
        channelOptions: this.options.grpcChannelOptions,
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown source type: ${source.type}`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  protected createTransforms(apiName: string, config: SourceTransformsOptions = {}) {
    const transforms: Array<any> = []

    if (config.rename) {
      transforms.push(
        new RenameTransform({
          config: config.rename,
        })
      )
    }

    if (config.filterSchema) {
      transforms.push(
        new FilterTransform({
          config: config.filterSchema,
        })
      )
    }

    if (config.encapsulate) {
      transforms.push(
        new EncapsulateTransform({
          apiName,
          importFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.encapsulate,
          cache: this.cache,
          pubsub: this.pubsub as unknown as MeshPubSub,
          logger: this.logger,
        })
      )
    }

    if (config.prefix) {
      transforms.push(
        new PrefixTransform({
          apiName,
          importFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.prefix,
          cache: this.cache,
          pubsub: this.pubsub as unknown as MeshPubSub,
          logger: this.logger,
        })
      )
    }

    if (config.cache) {
      transforms.push(
        new CacheTransform({
          apiName,
          importFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.cache,
          cache: this.cache,
          pubsub: this.pubsub as unknown as MeshPubSub,
          logger: this.logger,
        })
      )
    }

    if (config.snapshot) {
      transforms.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
          importFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.resolversComposition,
          cache: this.cache,
          pubsub: this.pubsub as unknown as MeshPubSub,
          logger: this.logger,
        })
      )
    }

    if (config.namingConvention) {
      transforms.push(
        new NamingConventionTransform({
          apiName,
          importFn: this.syncImportFn,
          baseDir: this.baseDir,
          config: config.namingConvention,
          cache: this.cache,
          pubsub: this.pubsub as unknown as MeshPubSub,
          logger: this.logger,
        })
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return transforms
  }
}
