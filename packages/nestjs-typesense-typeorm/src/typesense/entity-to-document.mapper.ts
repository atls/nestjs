import { Injectable }                from '@nestjs/common'
import { Client }                    from 'typesense'

import { TypesenseMetadataRegistry } from '@atls/nestjs-typesense'

@Injectable()
export class EntityToDocumentMapper {
  constructor(
    private readonly typesense: Client,
    private readonly registry: TypesenseMetadataRegistry
  ) {}

  async insert<T extends Record<string, unknown> & { id?: number | string }>(
    entity: T
  ): Promise<void> {
    const target = entity.constructor as new (...args: Array<unknown>) => object
    const schema = this.registry.getSchemaByTarget(target)

    if (!schema) {
      throw new Error(`Typesense schema not found for entity ${target.name}`)
    }

    const document = this.buildDocument(entity)

    await this.typesense.collections(schema.name).documents().create(document)
  }

  async update<T extends Record<string, unknown> & { id?: number | string }>(
    entity: T
  ): Promise<void> {
    const target = entity.constructor as new (...args: Array<unknown>) => object
    const schema = this.registry.getSchemaByTarget(target)

    if (!schema) {
      throw new Error(`Typesense schema not found for entity ${target.name}`)
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
