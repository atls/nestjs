import { Logger }     from '@atls/logger'
import { Injectable } from '@nestjs/common'

import { Schema }     from './schema.metadata'

type Constructor = new (...args: any[]) => {}

@Injectable()
export class TypesenseMetadataRegistry {
  private logger = new Logger(TypesenseMetadataRegistry.name)

  private schemas: Map<Constructor, Schema> = new Map()

  addSchema(target: Constructor, schema: Schema) {
    if (this.schemas.has(target)) {
      this.logger.warn(`Schema ${target} already exists`)
    }

    this.schemas.set(target, schema)
  }

  getSchemaByTarget(target: Constructor) {
    return this.schemas.get(target)
  }

  getTargets() {
    return this.schemas.keys()
  }
}
