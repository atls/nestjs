import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '../../../nestjs-typesense'

@Injectable()
export class EntityToDocumentMapper {
  constructor(
    private readonly typesense: Client,
    private readonly registry: TypesenseMetadataRegistry
  ) {}

  // @ts-ignore
  async insert(entity) {
    const schema = this.registry.getSchemaByTarget(entity.constructor)
    const document = this.buildDocument(entity)

    await this.typesense.collections(schema!.name).documents().create(document)
  }

  // @ts-ignore
  async update(entity) {
    const schema = this.registry.getSchemaByTarget(entity.constructor)
    const document = this.buildDocument(entity)

    await this.typesense.collections(schema!.name).documents().update(document)
  }

  // @ts-ignore
  private buildDocument(entity) {
    return {
      ...entity,
      ...(entity.id ? { id: String(entity.id) } : {}),
    }
  }
}