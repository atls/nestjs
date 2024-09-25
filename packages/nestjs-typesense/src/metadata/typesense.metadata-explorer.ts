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
    this.discoveryService.getProviders().forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper

      if (!instance || !Object.getPrototypeOf(instance)) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.lookupSchema(instance)
    })
  }

  lookupSchema(instance: object): void {
    const metadata = this.metadataAccessor.getTypesenseMetadata(instance)

    if (metadata) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.metadataRegistry.addSchema((instance as any).constructor, metadata)
    }
  }
}
