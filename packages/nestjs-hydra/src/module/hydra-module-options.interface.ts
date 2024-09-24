import type { ModuleMetadata } from '@nestjs/common/interfaces'
import type { Type }           from '@nestjs/common/interfaces'

export interface HydraModuleUrlsOptions {
  admin: string
}

export interface HydraModuleTlsOptions {
  termination?: boolean
}

export interface HydraModuleOptions {
  urls: HydraModuleUrlsOptions
  tls?: HydraModuleTlsOptions
  global?: boolean
}

export interface HydraOptionsFactory {
  createHydraOptions: () => HydraModuleOptions | Promise<HydraModuleOptions>
}

export interface HydraModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HydraOptionsFactory>
  useClass?: Type<HydraOptionsFactory>
  useFactory?: (...args: Array<any>) => HydraModuleOptions | Promise<HydraModuleOptions>
  inject?: Array<any>
  global?: boolean
}
