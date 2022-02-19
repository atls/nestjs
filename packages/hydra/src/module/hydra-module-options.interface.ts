import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'

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
  createHydraOptions(): Promise<HydraModuleOptions> | HydraModuleOptions
}

export interface HydraModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HydraOptionsFactory>
  useClass?: Type<HydraOptionsFactory>
  useFactory?: (...args: any[]) => Promise<HydraModuleOptions> | HydraModuleOptions
  inject?: any[]
  global?: boolean
}
