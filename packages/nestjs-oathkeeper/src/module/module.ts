import type { DynamicModule }                from '@nestjs/common'
import type { Provider }                     from '@nestjs/common'

import type { OathkeeperModuleAsyncOptions } from './interfaces.js'
import type { OathkeeperModuleOptions }      from './interfaces.js'
import type { OathkeeperOptionsFactory }     from './interfaces.js'

import { Module }                            from '@nestjs/common'

import { OATHKEEPER_MODULE_OPTIONS }         from './constants.js'
import { createOathkeeperExportsProvider }   from './providers.js'
import { createOathkeeperOptionsProvider }   from './providers.js'

@Module({})
export class OathkeeperModule {
  static register(options: OathkeeperModuleOptions): DynamicModule {
    const optionsProviders = createOathkeeperOptionsProvider(options)
    const exportsProviders = createOathkeeperExportsProvider()

    return {
      global: options.global ?? true,
      module: OathkeeperModule,
      providers: [...optionsProviders, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: OathkeeperModuleAsyncOptions): DynamicModule {
    const exportsProviders = createOathkeeperExportsProvider()

    return {
      global: options.global ?? true,
      module: OathkeeperModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: OathkeeperModuleAsyncOptions): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    if (!options.useClass) {
      throw new Error('OathkeeperModule requires useClass when useExisting/useFactory not provided')
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: OathkeeperModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OATHKEEPER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const injectTarget = options.useExisting ?? options.useClass

    if (!injectTarget) {
      throw new Error('OathkeeperModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: OATHKEEPER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: OathkeeperOptionsFactory) =>
        optionsFactory.createOathkeeperOptions(),
      inject: [injectTarget],
    }
  }
}
