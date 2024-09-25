import type { ModuleMetadata } from '@nestjs/common/interfaces'
import type { Type }           from '@nestjs/common/interfaces'
import type { GrpcOptions }    from '@nestjs/microservices'

import type { Authenticator }  from '../authenticators/index.js'

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
    ...args: Array<any>
  ) => GrpcHttpProxyModuleOptions | Promise<GrpcHttpProxyModuleOptions>
  inject?: Array<any>
}
