import { Provider }                        from '@nestjs/common'
import { DynamicModule }                   from '@nestjs/common'
import { Module }                          from '@nestjs/common'

import { KetoOptionsFactory }              from './keto-module.interfaces'
import { KetoModuleAsyncOptions }          from './keto-module.interfaces'
import { KetoModuleOptions }               from './keto-module.interfaces'
import { KETO_MODULE_CONFIGURATION }       from './keto.constants'
import { createKetoExportsProvider }       from './keto.providers'
import { createKetoConfigurationProvider } from './keto.providers'

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

  private static createAsyncProviders(options: KetoModuleAsyncOptions): Provider[] {
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
      useFactory: (optionsFactory: KetoOptionsFactory) => optionsFactory.createKetoOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
