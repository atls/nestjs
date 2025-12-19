import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

export interface GcsClientModuleOptions {
  apiEndpoint?: string
  keyFilename?: string
}

export interface GcsClientOptionsFactory {
  createGcsClientOptions: () => GcsClientModuleOptions | Promise<GcsClientModuleOptions>
}

export interface GcsClientModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GcsClientOptionsFactory>
  useClass?: Type<GcsClientOptionsFactory>
  useFactory?: (...args: Array<unknown>) => GcsClientModuleOptions | Promise<GcsClientModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
