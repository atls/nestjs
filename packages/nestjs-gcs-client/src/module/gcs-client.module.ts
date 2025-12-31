import type { DynamicModule }               from '@nestjs/common'
import type { Provider }                    from '@nestjs/common'

import type { GcsClientModuleOptions }      from './gcs-client.module.interfaces.js'
import type { GcsClientModuleAsyncOptions } from './gcs-client.module.interfaces.js'
import type { GcsClientOptionsFactory }     from './gcs-client.module.interfaces.js'

import { Module }                           from '@nestjs/common'

import { GcsClientConfigFactory }           from './gcs-client.config-factory.js'
import { GcsClientFactory }                 from './gcs-client.factory.js'
import { GCS_CLIENT_MODULE_OPTIONS }        from './gcs-client.module.constants.js'

@Module({})
export class GcsClientModule {
  static register(options: GcsClientModuleOptions = {}): DynamicModule {
    return {
      module: GcsClientModule,
      providers: [
        GcsClientConfigFactory,
        GcsClientFactory,
        {
          provide: GCS_CLIENT_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [GcsClientConfigFactory, GcsClientFactory],
    }
  }

  static registerAsync(options: GcsClientModuleAsyncOptions): DynamicModule {
    return {
      module: GcsClientModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), GcsClientConfigFactory, GcsClientFactory],
      exports: [GcsClientConfigFactory, GcsClientFactory],
    }
  }

  private static createAsyncProviders(options: GcsClientModuleAsyncOptions): Array<Provider> {
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

  private static createAsyncOptionsProvider(options: GcsClientModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GCS_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const injectTarget = options.useExisting ?? options.useClass
    if (!injectTarget) {
      throw new Error('GcsClientModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: GCS_CLIENT_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: GcsClientOptionsFactory
      ): GcsClientModuleOptions | Promise<GcsClientModuleOptions> =>
        optionsFactory.createGcsClientOptions(),
      inject: [injectTarget],
    }
  }
}
