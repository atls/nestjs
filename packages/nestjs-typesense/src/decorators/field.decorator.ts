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
  | 'bool'
  | 'bool[]'
  | 'float'
  | 'float[]'
  | 'geopoint'
  | 'int32'
  | 'int32[]'
  | 'int64'
  | 'int64[]'
  | 'string'
  | 'string[]'

export const FIELD_METADATA = '__fieldMetadata__'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const Field = (type: FieldType, options: FieldMetadata = {}) =>
  applyDecorators((target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
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
