import type { Provider }               from '@nestjs/common'
import type { DynamicModule }          from '@nestjs/common'

import type { KetoOptionsFactory }     from './keto-module.interfaces.js'
import type { KetoModuleAsyncOptions } from './keto-module.interfaces.js'
import type { KetoModuleOptions }      from './keto-module.interfaces.js'

import { Module }                      from '@nestjs/common'

import { KETO_MODULE_OPTIONS }         from './keto.constants.js'
import { createKetoExportsProvider }   from './keto.providers.js'
import { createKetoOptionsProvider }   from './keto.providers.js'

@Module({})
export class KetoModule {
  static register(options: KetoModuleOptions): DynamicModule {
    const optionsProvider = createKetoOptionsProvider(options)
    const exportsProvider = createKetoExportsProvider()

    return {
      global: options.global ?? true,
      module: KetoModule,
      providers: [...optionsProvider, ...exportsProvider],
      exports: exportsProvider,
    }
  }

  static registerAsync(options: KetoModuleAsyncOptions): DynamicModule {
    const exportsProvider = createKetoExportsProvider()

    return {
      global: options.global ?? true,
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

    if (!options.useClass) {
      throw new Error('KetoModule requires useClass when useExisting/useFactory not provided')
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: KetoModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: KETO_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const injectTarget = options.useExisting ?? options.useClass
    if (!injectTarget) {
      throw new Error('KetoModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: KETO_MODULE_OPTIONS,
      useFactory: async (optionsFactory: KetoOptionsFactory) => optionsFactory.createKetoOptions(),
      inject: [injectTarget],
    }
  }
}
