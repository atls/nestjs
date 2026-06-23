import type { Storage }                        from '@google-cloud/storage'
import type { DynamicModule }                  from '@nestjs/common'
import type { Provider }                       from '@nestjs/common'

import type { SignedUrlReadOptions }           from '../interfaces.js'
import type { SignedUrlWriteOptions }          from '../interfaces.js'
import type { GcsSignedUrlModuleAsyncOptions } from './interfaces.js'
import type { GcsSignedUrlModuleOptions }      from './interfaces.js'
import type { SignedUrlModuleAsyncOptions }    from './interfaces.js'
import type { SignedUrlModuleOptions }         from './interfaces.js'

import { Module }                              from '@nestjs/common'

import { SIGNED_URL_GATEWAY }                  from '../constants.js'
import { GCS_SIGNED_URL_CLIENT }               from '../gcs/constants.js'
import { GcsSignedUrlGateway }                 from '../gcs/gateway.js'
import { GcsSignedUrlSigner }                  from '../gcs/signer.js'
import { SignedUrlSigner }                     from '../signer.js'

@Module({})
export class SignedUrlModule {
  static register<
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleOptions<ReadOptions, WriteOptions>): DynamicModule {
    return this.createSignedUrlModule(options, this.createSignedUrlGatewayProviders(options))
  }

  static registerAsync<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(options: SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>): DynamicModule {
    return this.createSignedUrlModule(options, this.createSignedUrlGatewayProviders(options))
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
    return this.createGcsModule(this.createGcsClientProvider(options), options.imports || [])
  }

  private static createSignedUrlModule<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(
    options:
      | SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>
      | SignedUrlModuleOptions<ReadOptions, WriteOptions>,
    providers: Array<Provider>
  ): DynamicModule {
    return {
      module: SignedUrlModule,
      imports: options.imports || [],
      providers: [SignedUrlSigner, ...providers],
      exports: [SignedUrlSigner, SIGNED_URL_GATEWAY],
    }
  }

  private static createSignedUrlGatewayProviders<
    FactoryArgs extends ReadonlyArray<unknown> = ReadonlyArray<unknown>,
    ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
    WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
  >(
    options:
      | SignedUrlModuleAsyncOptions<FactoryArgs, ReadOptions, WriteOptions>
      | SignedUrlModuleOptions<ReadOptions, WriteOptions>
  ): Array<Provider> {
    if ('useValue' in options) {
      return [
        {
          provide: SIGNED_URL_GATEWAY,
          useValue: options.useValue,
        },
      ]
    }

    if ('useExisting' in options) {
      return [
        {
          provide: SIGNED_URL_GATEWAY,
          useExisting: options.useExisting,
        },
      ]
    }

    if ('useFactory' in options) {
      return [
        {
          provide: SIGNED_URL_GATEWAY,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ]
    }

    if ('useClass' in options) {
      return [
        options.useClass,
        {
          provide: SIGNED_URL_GATEWAY,
          useExisting: options.useClass,
        },
      ]
    }

    throw new Error('SignedUrlModule requires useValue, useExisting, useClass, or useFactory')
  }

  private static createGcsModule(
    clientProvider: Provider<Storage>,
    imports: DynamicModule['imports'] = []
  ): DynamicModule {
    const signedUrlGateway: Provider = {
      provide: SIGNED_URL_GATEWAY,
      useExisting: GcsSignedUrlGateway,
    }

    return {
      module: SignedUrlModule,
      imports,
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
