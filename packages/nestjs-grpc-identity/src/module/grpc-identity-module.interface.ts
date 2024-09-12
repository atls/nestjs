import { ModuleMetadata }         from '@nestjs/common/interfaces'
import { Type }                   from '@nestjs/common/interfaces'

import { Options as JwksOptions } from 'jwks-rsa'

export interface GrpcIdentityModuleOptions {
  jwks: JwksOptions
}

export interface GrpcIdentityOptionsFactory {
  createGrpcIdentityOptions(): Promise<GrpcIdentityModuleOptions> | GrpcIdentityModuleOptions
}

export interface GrpcIdentityModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcIdentityOptionsFactory>
  useClass?: Type<GrpcIdentityOptionsFactory>
  useFactory?: (...args: any[]) => Promise<GrpcIdentityModuleOptions> | GrpcIdentityModuleOptions
  inject?: any[]
}
