import type { InjectionToken }            from '@nestjs/common'
import type { ModuleMetadata }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { Type }                      from '@nestjs/common'
import type { GrpcOptions }               from '@nestjs/microservices'

import type { Authenticator }             from '../authenticators/index.js'

export interface GrpcHttpProxyModuleOptions {
  options: GrpcOptions['options']
  authenticator?: Authenticator
}

export interface GrpcHttpProxyOptionsFactory {
  createGrpcHttpProxyOptions: () => GrpcHttpProxyModuleOptions | Promise<GrpcHttpProxyModuleOptions>
}

export interface GrpcHttpProxyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcHttpProxyOptionsFactory>
  useClass?: Type<GrpcHttpProxyOptionsFactory>
  useFactory?: (
    ...args: Array<unknown>
  ) => GrpcHttpProxyModuleOptions | Promise<GrpcHttpProxyModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
