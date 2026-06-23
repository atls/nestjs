import type { Storage }          from '@google-cloud/storage'
import type { DynamicModule }    from '@nestjs/common'
import type { InjectionToken }   from '@nestjs/common'
import type { ModuleMetadata }   from '@nestjs/common'
import type { Provider }         from '@nestjs/common'

import { Module }                from '@nestjs/common'

import { SIGNED_URL_PROVIDER }   from './constants.js'
import { GCS_SIGNED_URL_CLIENT } from './gcs/index.js'
import { GcsSignedUrlGateway }   from './gcs/index.js'
import { SignedUrlSigner }       from './signer.js'

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
> =
  | GcsSignedUrlModuleExistingOptions
  | GcsSignedUrlModuleFactoryOptions<FactoryArgs>

@Module({})
export class SignedUrlModule {
  static gcs(options: GcsSignedUrlModuleOptions): DynamicModule {
    const clientProvider: Provider<Storage> = {
      provide: GCS_SIGNED_URL_CLIENT,
      useValue: options.useValue,
    }

    return this.createGcsModule(clientProvider)
  }

  static gcsAsync<FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>>(
    options: GcsSignedUrlModuleAsyncOptions<FactoryArgs>
  ): DynamicModule {
    return {
      ...this.createGcsModule(this.createGcsClientProvider(options)),
      imports: options.imports || [],
    }
  }

  private static createGcsModule(clientProvider: Provider<Storage>): DynamicModule {
    const signedUrlProvider: Provider = {
      provide: SIGNED_URL_PROVIDER,
      useExisting: GcsSignedUrlGateway,
    }

    return {
      module: SignedUrlModule,
      providers: [SignedUrlSigner, clientProvider, GcsSignedUrlGateway, signedUrlProvider],
      exports: [SignedUrlSigner, SIGNED_URL_PROVIDER],
    }
  }

  private static createGcsClientProvider<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  >(
    options: GcsSignedUrlModuleAsyncOptions<FactoryArgs>
  ): Provider<Storage> {
    if ('useFactory' in options) {
      return {
        provide: GCS_SIGNED_URL_CLIENT,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: GCS_SIGNED_URL_CLIENT,
      useExisting: options.useExisting,
    }
  }
}
