import type { OnModuleInit }         from '@nestjs/common'
import type { InstanceWrapper }      from '@nestjs/core/injector/instance-wrapper.js'

import { Logger }                    from '@atls/logger'
import { Injectable }                from '@nestjs/common'
import { DiscoveryService }          from '@nestjs/core'

import { TypesenseMetadataAccessor } from './typesense.metadata-accessor.js'
import { TypesenseMetadataRegistry } from './typesense.metadata-registry.js'

@Injectable()
export class TypesenseMetadataExplorer implements OnModuleInit {
  private readonly logger = new Logger(TypesenseMetadataExplorer.name)

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TypesenseMetadataAccessor,
    private readonly metadataRegistry: TypesenseMetadataRegistry
  ) {}

  onModuleInit(): void {
    this.explore()
  }

  explore(): void {
    this.discoveryService.getProviders().forEach((wrapper: InstanceWrapper<unknown>) => {
      const { instance } = wrapper

      if (!instance || (typeof instance !== 'object' && typeof instance !== 'function')) {
        return
      }

      if (!Object.getPrototypeOf(instance)) {
        return
      }

      this.lookupSchema(instance)
    })
  }

  lookupSchema(instance: object): void {
    const metadata = this.metadataAccessor.getTypesenseMetadata(instance)

    if (metadata) {
      const constructor = instance.constructor as new (...args: Array<unknown>) => object
      this.metadataRegistry.addSchema(constructor, metadata)
    }
  }
}
