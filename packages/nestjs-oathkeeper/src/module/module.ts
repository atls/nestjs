import type { DynamicModule }                    from '@nestjs/common'

import type { OathkeeperModuleAsyncOptions }     from './interfaces.js'
import type { OathkeeperModuleOptions }          from './interfaces.js'

import { Module }                                from '@nestjs/common'

import { createOathkeeperAsyncOptionsProviders } from './providers.js'
import { createOathkeeperExportProviders }       from './providers.js'
import { createOathkeeperOptionsProvider }       from './providers.js'

@Module({})
export class OathkeeperModule {
  static register(options: OathkeeperModuleOptions): DynamicModule {
    const optionsProvider = createOathkeeperOptionsProvider(options)
    const exportProviders = createOathkeeperExportProviders()

    return {
      global: options.global ?? true,
      module: OathkeeperModule,
      providers: [optionsProvider, ...exportProviders],
      exports: exportProviders,
    }
  }

  static registerAsync(options: OathkeeperModuleAsyncOptions): DynamicModule {
    const optionsProviders = createOathkeeperAsyncOptionsProviders(options)
    const exportProviders = createOathkeeperExportProviders()

    return {
      global: options.global ?? true,
      module: OathkeeperModule,
      imports: options.imports || [],
      providers: [...optionsProviders, ...exportProviders],
      exports: exportProviders,
    }
  }
}
