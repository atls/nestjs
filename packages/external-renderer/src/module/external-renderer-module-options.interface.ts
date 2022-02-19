import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'

export interface ExternalRendererModuleOptions {
  url: string
}

export interface ExternalRendererOptionsFactory {
  createExternalRendererOptions():
    | Promise<ExternalRendererModuleOptions>
    | ExternalRendererModuleOptions
}

export interface ExternalRendererModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ExternalRendererOptionsFactory>
  useClass?: Type<ExternalRendererOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<ExternalRendererModuleOptions> | ExternalRendererModuleOptions
  inject?: any[]
}
