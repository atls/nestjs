import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'
import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { LogLevelDesc }              from 'loglevel'

export interface TypesenseNodeOptions {
  host: string
  port: number
  protocol: string
}

export interface TypesenseModuleOptions {
  nodes?: Array<TypesenseNodeOptions>
  numRetries?: number
  apiKey?: string
  connectionTimeoutSeconds?: number
  retryIntervalSeconds?: number
  healthcheckIntervalSeconds?: number
  logLevel?: LogLevelDesc
}

export interface TypesenseOptionsFactory {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  createTypesenseOptions(): Promise<TypesenseModuleOptions> | TypesenseModuleOptions
}

export interface TypesenseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<TypesenseOptionsFactory>
  useClass?: Type<TypesenseOptionsFactory>
  useFactory?: (...args: Array<unknown>) => Promise<TypesenseModuleOptions> | TypesenseModuleOptions
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
