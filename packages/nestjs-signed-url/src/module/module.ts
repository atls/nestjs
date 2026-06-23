import type { Storage }                        from '@google-cloud/storage'
import type { DynamicModule }                  from '@nestjs/common'
import type { Provider }                       from '@nestjs/common'

import type { GcsSignedUrlModuleAsyncOptions } from './module.interfaces.js'
import type { GcsSignedUrlModuleOptions }      from './module.interfaces.js'

import { Module }                              from '@nestjs/common'

import { SIGNED_URL_GATEWAY }                  from '../constants.js'
import { GCS_SIGNED_URL_CLIENT }               from '../gcs/index.js'
import { GcsSignedUrlGateway }                 from '../gcs/index.js'
import { GcsSignedUrlSigner }                  from '../gcs/index.js'
import { SignedUrlSigner }                     from '../signer.js'

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
    const signedUrlGateway: Provider = {
      provide: SIGNED_URL_GATEWAY,
      useExisting: GcsSignedUrlGateway,
    }

    return {
      module: SignedUrlModule,
      providers: [
        GcsSignedUrlSigner,
        {
          provide: SignedUrlSigner,
          useExisting: GcsSignedUrlSigner,
        },
        clientProvider,
        GcsSignedUrlGateway,
        signedUrlGateway,
      ],
      exports: [SignedUrlSigner, GcsSignedUrlSigner, SIGNED_URL_GATEWAY],
    }
  }

  private static createGcsClientProvider<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
  >(options: GcsSignedUrlModuleAsyncOptions<FactoryArgs>): Provider<Storage> {
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
