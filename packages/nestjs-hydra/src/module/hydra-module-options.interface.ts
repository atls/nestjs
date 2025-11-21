import type { InjectionToken }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

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
  useFactory?: (...args: Array<unknown>) => HydraModuleOptions | Promise<HydraModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
  global?: boolean
}
