import { Provider }                         from '@nestjs/common'

import { TypeOrmListenersBuilder }          from '../typeorm'
import { EntityToDocumentMapper }           from '../typesense'
import { TypesenseTypeOrmModuleOptions }    from './typesense-typeorm-module.interface'
import { TYPESENSE_TYPEORM_MODULE_OPTIONS } from './typesense-typeorm.constants'

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
