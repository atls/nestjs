import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '@atls/nestjs-typesense'

@Injectable()
export class EntityToDocumentMapper {
  constructor(
    private readonly typesense: Client,
    private readonly registry: TypesenseMetadataRegistry
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async insert(entity: any): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const schema = this.registry.getSchemaByTarget(entity.constructor)
    const document = this.buildDocument(entity)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.typesense.collections(schema!.name).documents().create(document)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async update(entity: any): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const schema = this.registry.getSchemaByTarget(entity.constructor)
    const document = this.buildDocument(entity)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.typesense.collections(schema!.name).documents().update(document, {})
  }

  private buildDocument(entity: any): any {
    return {
      ...entity,
      ...(entity.id ? { id: String(entity.id) } : {}),
    }
  }
}
