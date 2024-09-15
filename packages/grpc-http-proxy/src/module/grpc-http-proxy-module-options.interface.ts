import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'
import { GrpcOptions }    from '@nestjs/microservices'

import { Authenticator }  from '../authenticators/index.js'

export interface GrpcHttpProxyModuleOptions {
  options: GrpcOptions['options']
  authenticator?: Authenticator
}

export interface GrpcHttpProxyOptionsFactory {
  createGrpcHttpProxyOptions(): Promise<GrpcHttpProxyModuleOptions> | GrpcHttpProxyModuleOptions
}

export interface GrpcHttpProxyModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcHttpProxyOptionsFactory>
  useClass?: Type<GrpcHttpProxyOptionsFactory>
  useFactory?: (...args: any[]) => Promise<GrpcHttpProxyModuleOptions> | GrpcHttpProxyModuleOptions
  inject?: any[]
}
