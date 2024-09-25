import type { DynamicModule }           from '@nestjs/common'
import type { Provider }                from '@nestjs/common'

import type { HydraModuleAsyncOptions } from './hydra-module-options.interface.js'
import type { HydraModuleOptions }      from './hydra-module-options.interface.js'
import type { HydraOptionsFactory }     from './hydra-module-options.interface.js'

import { Module }                       from '@nestjs/common'

import { HYDRA_MODULE_OPTIONS }         from './hydra.constants.js'
import { createHydraExportsProvider }   from './hydra.providers.js'
import { createHydraProvider }          from './hydra.providers.js'
import { createHydraOptionsProvider }   from './hydra.providers.js'

@Module({})
export class HydraModule {
  static register(options: HydraModuleOptions): DynamicModule {
    const optionsProviders = createHydraOptionsProvider(options)
    const exportsProviders = createHydraExportsProvider()
    const providers = createHydraProvider()

    return {
      global: options?.global ?? true,
      module: HydraModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: HydraModuleAsyncOptions): DynamicModule {
    const exportsProviders = createHydraExportsProvider()
    const providers = createHydraProvider()

    return {
      global: options?.global ?? true,
      module: HydraModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: HydraModuleAsyncOptions): Array<Provider> {
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

  private static createAsyncOptionsProvider(options: HydraModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: HYDRA_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: HYDRA_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HydraOptionsFactory) =>
        optionsFactory.createHydraOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
