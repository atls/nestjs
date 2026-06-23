import type { Storage }                        from '@google-cloud/storage'
import type { DynamicModule }                  from '@nestjs/common'
import type { Provider }                       from '@nestjs/common'

import type { SignedUrlGateway }               from '../interfaces.js'
import type { SignedUrlReadOptions }           from '../interfaces.js'
import type { SignedUrlWriteOptions }          from '../interfaces.js'
import type { GcsSignedUrlModuleAsyncOptions } from './interfaces.js'
import type { GcsSignedUrlModuleOptions }      from './interfaces.js'
import type { SignedUrlModuleAsyncOptions }    from './interfaces.js'
import type { SignedUrlModuleOptions }         from './interfaces.js'
import type { SignedUrlModuleOptionsFactory }  from './interfaces.js'

import { Module }                              from '@nestjs/common'

import { SIGNED_URL_GATEWAY }                  from '../constants.js'
import { GCS_SIGNED_URL_CLIENT }               from '../gcs/index.js'
import { GcsSignedUrlGateway }                 from '../gcs/index.js'
import { GcsSignedUrlSigner }                  from '../gcs/index.js'
import { SignedUrlSigner }                     from '../signer.js'
import { SIGNED_URL_MODULE_OPTIONS }           from './constants.js'

@Module({})
export class SignedUrlModule {
  static register<
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleOptions<ReadOptions, WriteOptions>): DynamicModule {
    return this.createModule([
      SignedUrlSigner,
      {
        provide: SIGNED_URL_MODULE_OPTIONS,
        useValue: options,
      },
      this.createSignedUrlGatewayProvider(),
    ])
  }

  static registerAsync<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>): DynamicModule {
    return {
      ...this.createModule([
        SignedUrlSigner,
        ...this.createAsyncProviders(options),
        this.createSignedUrlGatewayProvider(),
      ]),
      imports: options.imports || [],
    }
  }

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

  private static createModule(providers: Array<Provider>): DynamicModule {
    return {
      module: SignedUrlModule,
      providers,
      exports: [SignedUrlSigner, SIGNED_URL_GATEWAY],
    }
  }

  private static createAsyncProviders<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ]
  }

  private static createAsyncOptionsProvider<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>): Provider {
    if (options.useFactory) {
      return {
        provide: SIGNED_URL_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const injectTarget = options.useExisting ?? options.useClass
    if (!injectTarget) {
      throw new Error('SignedUrlModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: SIGNED_URL_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: SignedUrlModuleOptionsFactory<ReadOptions, WriteOptions>
      ):
        | Promise<SignedUrlModuleOptions<ReadOptions, WriteOptions>>
        | SignedUrlModuleOptions<ReadOptions, WriteOptions> =>
        optionsFactory.createSignedUrlModuleOptions(),
      inject: [injectTarget],
    }
  }

  private static createSignedUrlGatewayProvider(): Provider<SignedUrlGateway> {
    return {
      provide: SIGNED_URL_GATEWAY,
      useFactory: (options: SignedUrlModuleOptions): SignedUrlGateway => options.gateway,
      inject: [SIGNED_URL_MODULE_OPTIONS],
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
      exports: [SignedUrlSigner, GcsSignedUrlSigner, SIGNED_URL_GATEWAY, GCS_SIGNED_URL_CLIENT],
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
