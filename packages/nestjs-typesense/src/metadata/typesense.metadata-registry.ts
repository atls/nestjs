import type { Schema } from './schema.metadata.js'

import { Logger }      from '@atls/logger'
import { Injectable }  from '@nestjs/common'

type Constructor = new (...args: Array<unknown>) => object

@Injectable()
export class TypesenseMetadataRegistry {
  private logger = new Logger(TypesenseMetadataRegistry.name)

  private schemas: Map<Constructor, Schema> = new Map()

  addSchema(target: Constructor, schema: Schema): void {
    if (this.schemas.has(target)) {
      this.logger.warn(`Schema ${target.toString()} already exists`)
    }

    this.schemas.set(target, schema)
  }

  getSchemaByTarget(target: Constructor): Schema | undefined {
    return this.schemas.get(target)
  }

  getTargets(): IterableIterator<Constructor> {
    return this.schemas.keys()
  }
}
