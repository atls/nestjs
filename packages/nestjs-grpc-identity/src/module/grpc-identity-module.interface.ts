import type { ModuleMetadata }         from '@nestjs/common/interfaces'
import type { Type }                   from '@nestjs/common/interfaces'
import type { Options as JwksOptions } from 'jwks-rsa'

export interface GrpcIdentityModuleOptions {
  jwks: JwksOptions
}

export interface GrpcIdentityOptionsFactory {
  createGrpcIdentityOptions: () => GrpcIdentityModuleOptions | Promise<GrpcIdentityModuleOptions>
}

export interface GrpcIdentityModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcIdentityOptionsFactory>
  useClass?: Type<GrpcIdentityOptionsFactory>
  useFactory?: (
    ...args: Array<any>
  ) => GrpcIdentityModuleOptions | Promise<GrpcIdentityModuleOptions>
  inject?: Array<any>
}
