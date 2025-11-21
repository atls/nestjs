import type { DynamicModule }           from '@nestjs/common'
import type { Provider }                from '@nestjs/common'
import type { Type }                    from '@nestjs/common'

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

    if (!options.useClass) {
      throw new Error(
        'Invalid async options: expected useClass when no factory or existing provider is supplied'
      )
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
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

    const inject: Array<Type<HydraOptionsFactory>> = []

    if (options.useExisting) {
      inject.push(options.useExisting)
    } else if (options.useClass) {
      inject.push(options.useClass)
    } else {
      throw new Error('Invalid async options: expected either useExisting or useClass provider')
    }

    return {
      provide: HYDRA_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HydraOptionsFactory) =>
        optionsFactory.createHydraOptions(),
      inject,
    }
  }
}
