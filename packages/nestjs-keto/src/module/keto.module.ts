import type { Provider }                   from '@nestjs/common'
import type { DynamicModule }              from '@nestjs/common'

import type { KetoOptionsFactory }         from './keto-module.interfaces.js'
import type { KetoModuleAsyncOptions }     from './keto-module.interfaces.js'
import type { KetoModuleOptions }          from './keto-module.interfaces.js'

import { Module }                          from '@nestjs/common'

import { KETO_MODULE_CONFIGURATION }       from './keto.constants.js'
import { createKetoExportsProvider }       from './keto.providers.js'
import { createKetoConfigurationProvider } from './keto.providers.js'

@Module({})
export class KetoModule {
  static register(options: KetoModuleOptions): DynamicModule {
    const optionsProvider = createKetoConfigurationProvider(options)
    const exportsProvider = createKetoExportsProvider()

    return {
      global: options?.global ?? true,
      module: KetoModule,
      providers: [...optionsProvider, ...exportsProvider],
      exports: exportsProvider,
    }
  }

  static registerAsync(options: KetoModuleAsyncOptions): DynamicModule {
    const exportsProvider = createKetoExportsProvider()

    return {
      global: options?.global ?? true,
      module: KetoModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...exportsProvider],
      exports: exportsProvider,
    }
  }

  private static createAsyncProviders(options: KetoModuleAsyncOptions): Array<Provider> {
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

  private static createAsyncOptionsProvider(options: KetoModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: KETO_MODULE_CONFIGURATION,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: KETO_MODULE_CONFIGURATION,
      useFactory: async (optionsFactory: KetoOptionsFactory) => optionsFactory.createKetoOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
