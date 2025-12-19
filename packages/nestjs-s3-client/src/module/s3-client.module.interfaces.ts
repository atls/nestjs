import type { AwsCredentialIdentity }     from '@aws-sdk/types'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'
import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'

export interface S3ClientModuleOptions {
  endpoint?: string
  region?: string
  credentials?: AwsCredentialIdentity
}

export interface S3ClientOptionsFactory {
  createS3ClientOptions: () => Promise<S3ClientModuleOptions> | S3ClientModuleOptions
}

export interface S3ClientModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<S3ClientOptionsFactory>
  useClass?: Type<S3ClientOptionsFactory>
  useFactory?: (...args: Array<unknown>) => Promise<S3ClientModuleOptions> | S3ClientModuleOptions
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}
