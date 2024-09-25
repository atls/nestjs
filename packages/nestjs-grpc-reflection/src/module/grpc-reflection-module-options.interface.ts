import type { ModuleMetadata } from '@nestjs/common/interfaces'
import type { Type }           from '@nestjs/common/interfaces'
import type { GrpcOptions }    from '@nestjs/microservices'

export type GrpcReflectionModuleOptions = GrpcOptions['options']

export interface GrpcReflectionOptionsFactory {
  createGrpcReflectionOptions: () =>
    | GrpcReflectionModuleOptions
    | Promise<GrpcReflectionModuleOptions>
}

export interface GrpcReflectionModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcReflectionOptionsFactory>
  useClass?: Type<GrpcReflectionOptionsFactory>
  useFactory?: (
    ...args: Array<any>
  ) => GrpcReflectionModuleOptions | Promise<GrpcReflectionModuleOptions>
  inject?: Array<any>
}
