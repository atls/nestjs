import type { ModuleMetadata } from '@nestjs/common/interfaces'
import type { Type }           from '@nestjs/common/interfaces'

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
    ...args: Array<any>
  ) => ExternalRendererModuleOptions | Promise<ExternalRendererModuleOptions>
  inject?: Array<any>
}
