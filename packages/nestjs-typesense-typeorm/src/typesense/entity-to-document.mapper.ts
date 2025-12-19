import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '@atls/nestjs-typesense'

@Injectable()
export class EntityToDocumentMapper {
  constructor(
    private readonly typesense: Client,
    private readonly registry: TypesenseMetadataRegistry
  ) {}

  async insert(entity: Record<string, unknown> & { id?: number | string }): Promise<void> {
    const schema = this.registry.getSchemaByTarget(entity.constructor as any)
    if (!schema) {
      return
    }
    const document = this.buildDocument(entity)

    await this.typesense.collections(schema.name).documents().create(document)
  }

  async update(entity: Record<string, unknown> & { id?: number | string }): Promise<void> {
    const schema = this.registry.getSchemaByTarget(entity.constructor as any)
    if (!schema) {
      return
    }
    const document = this.buildDocument(entity)

    await this.typesense.collections(schema.name).documents().update(document, {})
  }

  private buildDocument(
    entity: Record<string, unknown> & { id?: number | string }
  ): Record<string, unknown> {
    return {
      ...entity,
      ...(entity.id ? { id: String(entity.id) } : {}),
    }
  }
}
