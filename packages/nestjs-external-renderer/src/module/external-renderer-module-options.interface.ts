import type { InjectionToken }            from '@nestjs/common'
import type { ModuleMetadata }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { Type }                      from '@nestjs/common'

export interface ExternalRendererModuleOptions {
  url: string
}

export interface ExternalRendererOptionsFactory {
  createExternalRendererOptions: () =>
    ExternalRendererModuleOptions | Promise<ExternalRendererModuleOptions>
}

export interface ExternalRendererModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ExternalRendererOptionsFactory>
  useClass?: Type<ExternalRendererOptionsFactory>
  useFactory?: (
    ...args: Array<unknown>
  ) => ExternalRendererModuleOptions | Promise<ExternalRendererModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
