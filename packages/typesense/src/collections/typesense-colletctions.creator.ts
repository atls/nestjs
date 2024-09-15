import { Logger }                    from '@atls/logger'
import { OnModuleInit }              from '@nestjs/common'
import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '../metadata'

@Injectable()
export class TypesenseCollectionsCreator implements OnModuleInit {
  private readonly logger = new Logger(TypesenseCollectionsCreator.name)

  constructor(
    private readonly registry: TypesenseMetadataRegistry,
    private readonly typesense: Client
  ) {}

  async onModuleInit() {
    for (const target of this.registry.getTargets()) {
      const schema = this.registry.getSchemaByTarget(target)

      try {
        // eslint-disable-next-line no-await-in-loop
        await this.typesense.collections(schema!.name).retrieve()
      } catch (error) {
        if ((error as any).httpStatus === 404) {
          // eslint-disable-next-line no-await-in-loop
          await this.typesense.collections().create(schema)
        }
      }
    }
  }
}
