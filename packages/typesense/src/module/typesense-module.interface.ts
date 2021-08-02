import { ModuleMetadata } from '@nestjs/common/interfaces'
import { Type }           from '@nestjs/common/interfaces'

export interface TypesenseNodeOptions {
  host: string
  port: string
  protocol: string
}

export interface TypesenseModuleOptions {
  nodes?: Array<TypesenseNodeOptions>
  numRetries?: number
  apiKey?: string
  connectionTimeoutSeconds?: number
  retryIntervalSeconds?: number
  healthcheckIntervalSeconds?: number
  logLevel?: string
}

export interface TypesenseOptionsFactory {
  createTypesenseOptions(): Promise<TypesenseModuleOptions> | TypesenseModuleOptions
}

export interface TypesenseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<TypesenseOptionsFactory>
  useClass?: Type<TypesenseOptionsFactory>
  useFactory?: (...args: any[]) => Promise<TypesenseModuleOptions> | TypesenseModuleOptions
  inject?: any[]
}
