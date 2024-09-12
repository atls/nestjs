import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'

export interface TypesenseTypeOrmModuleOptions {}

export interface TypesenseTypeOrmOptionsFactory {
  createTypesenseTypeOrmOptions():
    | Promise<TypesenseTypeOrmModuleOptions>
    | TypesenseTypeOrmModuleOptions
}

export interface TypesenseTypeOrmModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<TypesenseTypeOrmOptionsFactory>
  useClass?: Type<TypesenseTypeOrmOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<TypesenseTypeOrmModuleOptions> | TypesenseTypeOrmModuleOptions
  inject?: any[]
}
