import { DynamicModule }                         from '@nestjs/common'
import { Provider }                              from '@nestjs/common'
import { Module }                                from '@nestjs/common'

import { TypesenseTypeOrmModuleAsyncOptions }    from './typesense-typeorm-module.interface.js'
import { TypesenseTypeOrmModuleOptions }         from './typesense-typeorm-module.interface.js'
import { TypesenseTypeOrmOptionsFactory }        from './typesense-typeorm-module.interface.js'
import { TYPESENSE_TYPEORM_MODULE_OPTIONS }      from './typesense-typeorm.constants.js'
import { createTypesenseTypeOrmExportsProvider } from './typesense-typeorm.providers.js'
import { createTypesenseTypeOrmProvider }        from './typesense-typeorm.providers.js'
import { createTypesenseTypeOrmOptionsProvider } from './typesense-typeorm.providers.js'

@Module({})
export class TypesenseTypeOrmModule {
  static register(options: TypesenseTypeOrmModuleOptions = {}): DynamicModule {
    const optionsProviders = createTypesenseTypeOrmOptionsProvider(options)
    const exportsProviders = createTypesenseTypeOrmExportsProvider()
    const providers = createTypesenseTypeOrmProvider()

    return {
      module: TypesenseTypeOrmModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: TypesenseTypeOrmModuleAsyncOptions): DynamicModule {
    const exportsProviders = createTypesenseTypeOrmExportsProvider()
    const providers = createTypesenseTypeOrmProvider()

    return {
      module: TypesenseTypeOrmModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: TypesenseTypeOrmModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: TypesenseTypeOrmModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: TYPESENSE_TYPEORM_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: TYPESENSE_TYPEORM_MODULE_OPTIONS,
      useFactory: (optionsFactory: TypesenseTypeOrmOptionsFactory) =>
        optionsFactory.createTypesenseTypeOrmOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
