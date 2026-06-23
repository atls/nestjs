import type { Storage }                   from '@google-cloud/storage'
import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

import type { SignedUrlGateway }          from '../interfaces.js'
import type { SignedUrlReadOptions }      from '../interfaces.js'
import type { SignedUrlWriteOptions }     from '../interfaces.js'

export interface SignedUrlModuleOptions<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> {
  gateway: SignedUrlGateway<ReadOptions, WriteOptions>
}

export interface SignedUrlModuleOptionsFactory<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> {
  createSignedUrlModuleOptions: () =>
    | Promise<SignedUrlModuleOptions<ReadOptions, WriteOptions>>
    | SignedUrlModuleOptions<ReadOptions, WriteOptions>
}

export interface SignedUrlModuleAsyncOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SignedUrlModuleOptionsFactory<ReadOptions, WriteOptions>>
  useClass?: Type<SignedUrlModuleOptionsFactory<ReadOptions, WriteOptions>>
  useFactory?: (
    ...args: FactoryArgs
  ) =>
    | Promise<SignedUrlModuleOptions<ReadOptions, WriteOptions>>
    | SignedUrlModuleOptions<ReadOptions, WriteOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}

export interface GcsSignedUrlModuleOptions {
  useValue: Storage
}

export interface GcsSignedUrlModuleExistingOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting: InjectionToken
}

export interface GcsSignedUrlModuleFactoryOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: FactoryArgs) => Promise<Storage> | Storage
  inject?: Array<InjectionToken>
}

export type GcsSignedUrlModuleAsyncOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> = GcsSignedUrlModuleExistingOptions | GcsSignedUrlModuleFactoryOptions<FactoryArgs>
