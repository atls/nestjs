import { Injectable, OnModuleInit }  from '@nestjs/common'
import { DiscoveryService }          from '@nestjs/core'
import { InstanceWrapper }           from '@nestjs/core/injector/instance-wrapper'
import { Logger }                    from '@atls/logger'

import { TypesenseMetadataAccessor } from './typesense.metadata-accessor'
import { TypesenseMetadataRegistry } from './typesense.metadata-registry'

@Injectable()
export class TypesenseMetadataExplorer implements OnModuleInit {
  private readonly logger = new Logger(TypesenseMetadataExplorer.name)

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TypesenseMetadataAccessor,
    private readonly metadataRegistry: TypesenseMetadataRegistry
  ) {}

  onModuleInit() {
    this.explore()
  }

  explore() {
    this.discoveryService.getProviders().forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper

      if (!instance || !Object.getPrototypeOf(instance)) {
        return
      }

      this.lookupSchema(instance)
    })
  }

  lookupSchema(instance) {
    const metadata = this.metadataAccessor.getTypesenseMetadata(instance)

    if (metadata) {
      this.metadataRegistry.addSchema(instance.constructor, metadata)
    }
  }
}
