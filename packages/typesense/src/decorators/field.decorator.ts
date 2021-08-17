import { SetMetadata }     from '@nestjs/common'
import { applyDecorators } from '@nestjs/common'

export interface FieldMetadata {
  name?: string
  facet?: boolean
  index?: boolean
  optional?: boolean
}

export type FieldType =
  | 'auto'
  | 'string'
  | 'int32'
  | 'int64'
  | 'float'
  | 'bool'
  | 'geopoint'
  | 'string[]'
  | 'int32[]'
  | 'int64'
  | 'float[]'
  | 'bool[]'

export const FIELD_METADATA = '__fieldMetadata__'

export const Field = (type: FieldType, options: FieldMetadata = {}) =>
  applyDecorators((target: object, key?: any, descriptor?: any) => {
    const exists = Reflect.getMetadata(FIELD_METADATA, target.constructor) || []

    return SetMetadata(FIELD_METADATA, [
      ...exists,
      {
        ...options,
        type,
        name: options.name || key,
      },
    ])(target.constructor, key, descriptor)
  })
