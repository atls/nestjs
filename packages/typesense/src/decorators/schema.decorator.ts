import { SetMetadata }     from '@nestjs/common'
import { applyDecorators } from '@nestjs/common'
import decamelize          from 'decamelize'

export interface SchemaMetadata {
  name?: string
  defaultSortingField?: string
  auto?: boolean
}

export const SCHEMA_METADATA = '__schemaMetadata__'

export const Schema = (options: SchemaMetadata = {}): ClassDecorator =>
  applyDecorators((target: object, key?: any, descriptor?: any) =>
    SetMetadata(SCHEMA_METADATA, {
      name:
        options.name ||
        decamelize((target as any).name, { separator: '-', preserveConsecutiveUppercase: false }),
      defaultSortingField: options.defaultSortingField,
    })(target, key, descriptor)
  )
