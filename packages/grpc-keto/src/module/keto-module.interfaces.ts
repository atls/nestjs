import { ChannelCredentials } from '@grpc/grpc-js'
import { Type }               from '@nestjs/common/interfaces'
import { ModuleMetadata }     from '@nestjs/common/interfaces'

export interface KetoModuleOptions {
  read: string
  write: string
  credentials?: ChannelCredentials
  global?: boolean
}

export interface KetoOptionsFactory {
  createKetoOptions(): Promise<KetoModuleOptions> | KetoModuleOptions
}

export interface KetoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KetoOptionsFactory>
  useClass?: Type<KetoOptionsFactory>
  useFactory?: (...args: any[]) => Promise<KetoModuleOptions> | KetoModuleOptions
  inject?: any[]
  global?: boolean
}
