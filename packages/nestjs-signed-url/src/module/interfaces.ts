import type { Storage }                   from '@google-cloud/storage'
import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

import type { SignedUrlGateway }          from '../interfaces.js'
import type { SignedUrlReadOptions }      from '../interfaces.js'
import type { SignedUrlWriteOptions }     from '../interfaces.js'

export interface SignedUrlModuleValueOptions<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> extends Pick<ModuleMetadata, 'imports'> {
  useValue: SignedUrlGateway<ReadOptions, WriteOptions>
}

export interface SignedUrlModuleExistingOptions<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> extends Pick<ModuleMetadata, 'imports'> {
  useExisting: InjectionToken<SignedUrlGateway<ReadOptions, WriteOptions>>
}

export interface SignedUrlModuleClassOptions<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> extends Pick<ModuleMetadata, 'imports'> {
  useClass: Type<SignedUrlGateway<ReadOptions, WriteOptions>>
}

export type SignedUrlModuleOptions<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> =
  | SignedUrlModuleClassOptions<ReadOptions, WriteOptions>
  | SignedUrlModuleExistingOptions<ReadOptions, WriteOptions>
  | SignedUrlModuleValueOptions<ReadOptions, WriteOptions>

export interface SignedUrlModuleFactoryOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: FactoryArgs
  ) =>
    | Promise<SignedUrlGateway<ReadOptions, WriteOptions>>
    | SignedUrlGateway<ReadOptions, WriteOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}

export type SignedUrlModuleAsyncOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> =
  | SignedUrlModuleClassOptions<ReadOptions, WriteOptions>
  | SignedUrlModuleExistingOptions<ReadOptions, WriteOptions>
  | SignedUrlModuleFactoryOptions<FactoryArgs, ReadOptions, WriteOptions>

export interface GcsSignedUrlModuleOptions {
  useValue: Storage
}

export interface GcsSignedUrlModuleExistingOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting: InjectionToken<Storage>
}

export interface GcsSignedUrlModuleFactoryOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: FactoryArgs) => Promise<Storage> | Storage
  inject?: Array<InjectionToken | OptionalFactoryDependency>
}

export type GcsSignedUrlModuleAsyncOptions<
  FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
> = GcsSignedUrlModuleExistingOptions | GcsSignedUrlModuleFactoryOptions<FactoryArgs>
