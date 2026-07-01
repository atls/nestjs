import type { GetMeshOptions }          from '@graphql-mesh/runtime'
import type { MeshTransform }           from '@graphql-mesh/types'
import type { MeshPubSub }              from '@graphql-mesh/types'
import type { ImportFn }                from '@graphql-mesh/types'

import type { GatewayModuleOptions }    from '../module/gateway-module-options.interface.js'
import type { SourceOptions }           from '../module/gateway-module-options.interface.js'
import type { SourceTransformsOptions } from '../module/gateway-module-options.interface.js'

import { join }                         from 'node:path'

import { InMemoryStoreStorageAdapter }  from '@graphql-mesh/store'
import { MeshStore }                    from '@graphql-mesh/store'
import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'
import { resolveAdditionalTypeDefs }    from '@graphql-mesh/config'
import { defaultImportFn }              from '@graphql-mesh/utils'
import { resolveAdditionalResolvers }   from '@graphql-mesh/utils'
import InMemoryLRUCache                 from '@graphql-mesh/cache-inmemory-lru'
import StitchingMerger                  from '@graphql-mesh/merger-stitching'
import CacheTransform                   from '@graphql-mesh/transform-cache'
import EncapsulateTransform             from '@graphql-mesh/transform-encapsulate'
import FilterTransform                  from '@graphql-mesh/transform-filter-schema'
// @ts-expect-error import exists
import MockingTransform                 from '@graphql-mesh/transform-mock'
import NamingConventionTransform        from '@graphql-mesh/transform-naming-convention'
import PrefixTransform                  from '@graphql-mesh/transform-prefix'
import RenameTransform                  from '@graphql-mesh/transform-rename'
import ResolversCompositionTransform    from '@graphql-mesh/transform-resolvers-composition'
// @ts-expect-error import exists
import SnapshotTransform                from '@graphql-mesh/transform-snapshot'

import { GATEWAY_MESH_PUBSUB }          from '../module/gateway.constants.js'
import { GATEWAY_MODULE_OPTIONS }       from '../module/gateway.constants.js'
import { GraphQLMeshLogger }            from './graphql-mesh.logger.js'
import GrpcHandler                      from './handlers/grpc/grpc.handler.js'

type MeshTransformConstructor = new (options: Record<string, unknown>) => MeshTransform

const isStringArray = (value: unknown): value is Array<string> =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')

@Injectable()
export class GraphQLMeshConfig {
  private importFn: ImportFn

  private cache

  private merger

  private store

  private baseDir

  private transforms: Array<MeshTransform>

  private logger: GraphQLMeshLogger

  constructor(
    @Inject(GATEWAY_MODULE_OPTIONS)
    private readonly options: GatewayModuleOptions,
    @Inject(GATEWAY_MESH_PUBSUB)
    private readonly pubsub: MeshPubSub
  ) {
    this.logger = new GraphQLMeshLogger('Mesh')
    this.baseDir = process.cwd()
    this.cache = options.cache || new InMemoryLRUCache()
    this.store = new MeshStore(join(process.cwd(), '.mesh'), new InMemoryStoreStorageAdapter(), {
      readonly: false,
      validate: false,
    })

    this.importFn = defaultImportFn
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
    const additionalTypeDefs = await this.resolveAdditionalTypeDefs()
    const additionalResolvers = await resolveAdditionalResolvers(
      this.baseDir,
      this.options.additionalResolvers || [],
      this.importFn,
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
    return new GrpcHandler({
      // @ts-expect-error correct options
      name: source.name,
      config: source.handler,
      cache: this.cache,
      pubsub: this.pubsub,
      store: this.store,
      baseDir: this.baseDir,
      logger: this.logger,
      importFn: this.importFn,
      channelOptions: this.options.grpcChannelOptions,
    })
  }

  protected createTransforms(apiName: string, config: SourceTransformsOptions = {}) {
    const transforms: Array<MeshTransform> = []

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
          importFn: this.importFn,
          baseDir: this.baseDir,
          config: config.encapsulate,
          cache: this.cache,
          pubsub: this.pubsub,
          logger: this.logger,
        })
      )
    }

    if (config.prefix) {
      transforms.push(
        new PrefixTransform({
          apiName,
          importFn: this.importFn,
          baseDir: this.baseDir,
          config: config.prefix,
          cache: this.cache,
          pubsub: this.pubsub,
          logger: this.logger,
        })
      )
    }

    if (config.cache) {
      transforms.push(
        new CacheTransform({
          apiName,
          importFn: this.importFn,
          baseDir: this.baseDir,
          config: config.cache,
          cache: this.cache,
          pubsub: this.pubsub,
          logger: this.logger,
        })
      )
    }

    if (config.snapshot) {
      const snapshotConfig = config.snapshot as Record<string, unknown>
      const SnapshotTransformCtor = SnapshotTransform as unknown as MeshTransformConstructor
      const snapshotTransform = new SnapshotTransformCtor({
        apiName,
        importFn: this.importFn,
        baseDir: this.baseDir,
        config: snapshotConfig,
        cache: this.cache,
        pubsub: this.pubsub,
      }) as unknown as MeshTransform
      transforms.push(snapshotTransform)
    }

    if (config.mock) {
      const mockConfig = config.mock as Record<string, unknown>
      const MockingTransformCtor = MockingTransform as unknown as MeshTransformConstructor
      const mockTransform = new MockingTransformCtor({
        apiName,
        importFn: this.importFn,
        baseDir: this.baseDir,
        config: mockConfig,
        cache: this.cache,
        pubsub: this.pubsub,
      }) as unknown as MeshTransform
      transforms.push(mockTransform)
    }

    if (config.resolversComposition) {
      transforms.push(
        new ResolversCompositionTransform({
          apiName,
          importFn: this.importFn,
          baseDir: this.baseDir,
          config: config.resolversComposition,
          cache: this.cache,
          pubsub: this.pubsub,
          logger: this.logger,
        })
      )
    }

    if (config.namingConvention) {
      transforms.push(
        new NamingConventionTransform({
          apiName,
          importFn: this.importFn,
          baseDir: this.baseDir,
          config: config.namingConvention,
          cache: this.cache,
          pubsub: this.pubsub,
          logger: this.logger,
        })
      )
    }

    return transforms
  }

  private async resolveAdditionalTypeDefs(): Promise<GetMeshOptions['additionalTypeDefs']> {
    if (
      typeof this.options.additionalTypeDefs === 'string' ||
      isStringArray(this.options.additionalTypeDefs)
    ) {
      return resolveAdditionalTypeDefs(this.baseDir, this.options.additionalTypeDefs as string)
    }

    return this.options.additionalTypeDefs as GetMeshOptions['additionalTypeDefs']
  }
}
