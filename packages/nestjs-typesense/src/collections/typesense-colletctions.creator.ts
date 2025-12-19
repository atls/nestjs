import type { OnModuleInit }         from '@nestjs/common'

import { Logger }                    from '@atls/logger'
import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '../metadata/index.js'

@Injectable()
export class TypesenseCollectionsCreator implements OnModuleInit {
  private readonly logger = new Logger(TypesenseCollectionsCreator.name)

  constructor(
    private readonly registry: TypesenseMetadataRegistry,
    private readonly typesense: Client
  ) {}

  async onModuleInit(): Promise<void> {
    for (const target of this.registry.getTargets()) {
      const schema = this.registry.getSchemaByTarget(target)

      if (!schema) return

      try {
        // eslint-disable-next-line no-await-in-loop
        await this.typesense.collections(schema.name).retrieve()
      } catch (error) {
        if (
          error &&
          typeof error === 'object' &&
          'httpStatus' in error &&
          (error as { httpStatus?: number }).httpStatus === 404
        ) {
          // eslint-disable-next-line no-await-in-loop
          await this.typesense.collections().create(schema)
        }
      }
    }
  }
}
