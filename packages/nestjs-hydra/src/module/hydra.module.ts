import { DynamicModule }              from '@nestjs/common'
import { Module }                     from '@nestjs/common'
import { Provider }                   from '@nestjs/common'

import { HydraModuleAsyncOptions }    from './hydra-module-options.interface'
import { HydraModuleOptions }         from './hydra-module-options.interface'
import { HydraOptionsFactory }        from './hydra-module-options.interface'
import { HYDRA_MODULE_OPTIONS }       from './hydra.constants'
import { createHydraExportsProvider } from './hydra.providers'
import { createHydraProvider }        from './hydra.providers'
import { createHydraOptionsProvider } from './hydra.providers'

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

  private static createAsyncProviders(options: HydraModuleAsyncOptions): Provider[] {
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
      useFactory: (optionsFactory: HydraOptionsFactory) => optionsFactory.createHydraOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
