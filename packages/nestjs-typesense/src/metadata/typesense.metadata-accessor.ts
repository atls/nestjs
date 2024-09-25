import type { Schema }     from './schema.metadata.js'

import { Injectable }      from '@nestjs/common'
import { Reflector }       from '@nestjs/core'

import { SCHEMA_METADATA } from '../decorators/index.js'
import { FIELD_METADATA }  from '../decorators/index.js'

type Constructor<T> = new (...args: Array<any>) => T

@Injectable()
export class TypesenseMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  getTypesenseMetadata(target: Constructor<any> | object): Schema | undefined {
    if (target.constructor) {
      const schema = this.reflector.get(SCHEMA_METADATA, target.constructor)
      const fields = this.reflector.get(FIELD_METADATA, target.constructor)

      if (!schema) {
        return undefined
      }

      if (!(fields || schema.auto)) {
        return undefined
      }

      return {
        name: schema.name,
        defaultSortingField: schema.defaultSortingField,
        fields: [...(schema.auto ? [{ name: '.*', type: 'auto' }] : []), ...(fields || [])],
      }
    }

    return undefined
  }
}
