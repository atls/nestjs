import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

export interface ExternalRendererModuleOptions {
  url: string
}

export interface ExternalRendererOptionsFactory {
  createExternalRendererOptions: () =>
    | ExternalRendererModuleOptions
    | Promise<ExternalRendererModuleOptions>
}

export interface ExternalRendererModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ExternalRendererOptionsFactory>
  useClass?: Type<ExternalRendererOptionsFactory>
  useFactory?: (
    ...args: Array<unknown>
  ) => ExternalRendererModuleOptions | Promise<ExternalRendererModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
