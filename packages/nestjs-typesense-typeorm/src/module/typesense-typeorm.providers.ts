import { Provider }                         from '@nestjs/common'

import { TypeOrmListenersBuilder }          from '../typeorm/index.js'
import { EntityToDocumentMapper }           from '../typesense/index.js'
import { TypesenseTypeOrmModuleOptions }    from './typesense-typeorm-module.interface.js'
import { TYPESENSE_TYPEORM_MODULE_OPTIONS } from './typesense-typeorm.constants.js'

export const createTypesenseTypeOrmOptionsProvider = (
  options: TypesenseTypeOrmModuleOptions = {}
): Provider[] => [
  {
    provide: TYPESENSE_TYPEORM_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createTypesenseTypeOrmProvider = (): Provider[] => [
  TypeOrmListenersBuilder,
  EntityToDocumentMapper,
]

export const createTypesenseTypeOrmExportsProvider = (): Provider[] => []
