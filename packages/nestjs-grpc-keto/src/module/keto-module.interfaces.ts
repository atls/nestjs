import type { ChannelCredentials }        from '@grpc/grpc-js'
import type { InjectionToken }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'
import type { Type }                      from '@nestjs/common'
import type { ModuleMetadata }            from '@nestjs/common'

export interface KetoModuleOptions {
  read: string
  write: string
  credentials?: ChannelCredentials
  global?: boolean
}

export interface KetoOptionsFactory {
  createKetoOptions: () => KetoModuleOptions | Promise<KetoModuleOptions>
}

export interface KetoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KetoOptionsFactory>
  useClass?: Type<KetoOptionsFactory>
  useFactory?: (...args: Array<unknown>) => KetoModuleOptions | Promise<KetoModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
  global?: boolean
}
