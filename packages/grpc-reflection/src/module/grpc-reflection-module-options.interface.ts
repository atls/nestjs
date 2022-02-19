import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'
import { GrpcOptions }    from '@nestjs/microservices'

export type GrpcReflectionModuleOptions = GrpcOptions['options']

export interface GrpcReflectionOptionsFactory {
  createGrpcReflectionOptions(): Promise<GrpcReflectionModuleOptions> | GrpcReflectionModuleOptions
}

export interface GrpcReflectionModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<GrpcReflectionOptionsFactory>
  useClass?: Type<GrpcReflectionOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<GrpcReflectionModuleOptions> | GrpcReflectionModuleOptions
  inject?: any[]
}
