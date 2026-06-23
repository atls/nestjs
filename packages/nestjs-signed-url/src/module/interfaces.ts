import type { Storage }        from '@google-cloud/storage'
import type { InjectionToken } from '@nestjs/common'
import type { ModuleMetadata } from '@nestjs/common'

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
