import type { Provider }                      from '@nestjs/common'

import type { TypesenseTypeOrmModuleOptions } from './typesense-typeorm-module.interface.js'

import { TypeOrmListenersBuilder }            from '../typeorm/index.js'
import { EntityToDocumentMapper }             from '../typesense/index.js'
import { TYPESENSE_TYPEORM_MODULE_OPTIONS }   from './typesense-typeorm.constants.js'

export const createTypesenseTypeOrmOptionsProvider = (
  options: TypesenseTypeOrmModuleOptions = {}
): Array<Provider> => [
  {
    provide: TYPESENSE_TYPEORM_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createTypesenseTypeOrmProvider = (): Array<Provider> => [
  TypeOrmListenersBuilder,
  EntityToDocumentMapper,
]

export const createTypesenseTypeOrmExportsProvider = (): Array<Provider> => []
