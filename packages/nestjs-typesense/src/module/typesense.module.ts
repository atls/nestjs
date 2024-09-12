import { DynamicModule }                  from '@nestjs/common'
import { Provider }                       from '@nestjs/common'
import { Module }                         from '@nestjs/common'
import { DiscoveryModule }                from '@nestjs/core'

import { TypesenseModuleAsyncOptions }    from './typesense-module.interface.js'
import { TypesenseModuleOptions }         from './typesense-module.interface.js'
import { TypesenseOptionsFactory }        from './typesense-module.interface.js'
import { TYPESENSE_MODULE_OPTIONS }       from './typesense.constants.js'
import { createTypesenseExportsProvider } from './typesense.providers.js'
import { createTypesenseProvider }        from './typesense.providers.js'
import { createTypesenseOptionsProvider } from './typesense.providers.js'

@Module({
  imports: [DiscoveryModule],
})
export class TypesenseModule {
  static register(options: TypesenseModuleOptions = {}): DynamicModule {
    const optionsProviders = createTypesenseOptionsProvider(options)
    const exportsProviders = createTypesenseExportsProvider()
    const providers = createTypesenseProvider()

    return {
      global: true,
      module: TypesenseModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: TypesenseModuleAsyncOptions): DynamicModule {
    const exportsProviders = createTypesenseExportsProvider()
    const providers = createTypesenseProvider()

    return {
      global: true,
      module: TypesenseModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: TypesenseModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: TypesenseModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: TYPESENSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: TYPESENSE_MODULE_OPTIONS,
      useFactory: (optionsFactory: TypesenseOptionsFactory) =>
        optionsFactory.createTypesenseOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
