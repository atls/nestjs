import type { ChannelCredentials } from '@grpc/grpc-js'
import type { Type }               from '@nestjs/common/interfaces'
import type { ModuleMetadata }     from '@nestjs/common/interfaces'

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
  useFactory?: (...args: Array<any>) => KetoModuleOptions | Promise<KetoModuleOptions>
  inject?: Array<any>
  global?: boolean
}
