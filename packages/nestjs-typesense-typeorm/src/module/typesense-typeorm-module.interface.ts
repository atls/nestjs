import type { InjectionToken }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TypesenseTypeOrmModuleOptions {}

export interface TypesenseTypeOrmOptionsFactory {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  createTypesenseTypeOrmOptions():
    | Promise<TypesenseTypeOrmModuleOptions>
    | TypesenseTypeOrmModuleOptions
}

export interface TypesenseTypeOrmModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<TypesenseTypeOrmOptionsFactory>
  useClass?: Type<TypesenseTypeOrmOptionsFactory>
  useFactory?: (
    ...args: Array<unknown>
  ) => Promise<TypesenseTypeOrmModuleOptions> | TypesenseTypeOrmModuleOptions
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
