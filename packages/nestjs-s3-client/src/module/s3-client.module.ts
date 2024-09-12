import type { DynamicModule }              from '@nestjs/common'
import type { Provider }                   from '@nestjs/common'

import type { S3ClientModuleOptions }      from './s3-client.module.interfaces.js'
import type { S3ClientModuleAsyncOptions } from './s3-client.module.interfaces.js'
import type { S3ClientOptionsFactory }     from './s3-client.module.interfaces.js'

import { Module }                          from '@nestjs/common'

import { S3ClientConfigFactory }           from './s3-client.config-factory.js'
import { S3ClientFactory }                 from './s3-client.factory.js'
import { S3_CLIENT_MODULE_OPTIONS }        from './s3-client.module.constants.js'

@Module({})
export class S3ClientModule {
  static register(options: S3ClientModuleOptions = {}): DynamicModule {
    return {
      module: S3ClientModule,
      providers: [
        S3ClientConfigFactory,
        S3ClientFactory,
        {
          provide: S3_CLIENT_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [S3ClientConfigFactory, S3ClientFactory],
    }
  }

  static registerAsync(options: S3ClientModuleAsyncOptions): DynamicModule {
    return {
      module: S3ClientModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), S3ClientConfigFactory, S3ClientFactory],
      exports: [S3ClientConfigFactory, S3ClientFactory],
    }
  }

  private static createAsyncProviders(options: S3ClientModuleAsyncOptions): Array<Provider> {
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

  private static createAsyncOptionsProvider(options: S3ClientModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: S3_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: S3_CLIENT_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: S3ClientOptionsFactory
      ): Promise<S3ClientModuleOptions> | S3ClientModuleOptions =>
        optionsFactory.createS3ClientOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
