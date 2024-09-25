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
  applyDecorators((target: object, key: string | symbol, descriptor: PropertyDescriptor) =>
    SetMetadata(SCHEMA_METADATA, {
      name:
        options.name ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        decamelize((target as any).name, { separator: '-', preserveConsecutiveUppercase: false }),
      defaultSortingField: options.defaultSortingField,
    })(target, key, descriptor))
