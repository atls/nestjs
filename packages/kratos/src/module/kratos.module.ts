import { DynamicModule }               from '@nestjs/common'
import { Module }                      from '@nestjs/common'
import { Provider }                    from '@nestjs/common'

import { KratosModuleAsyncOptions }    from './kratos-module-options.interface'
import { KratosModuleOptions }         from './kratos-module-options.interface'
import { KratosOptionsFactory }        from './kratos-module-options.interface'
import { KRATOS_MODULE_OPTIONS }       from './kratos.constants'
import { createKratosExportsProvider } from './kratos.providers'
import { createKratosProvider }        from './kratos.providers'
import { createKratosOptionsProvider } from './kratos.providers'

@Module({})
export class KratosModule {
  static register(options: KratosModuleOptions): DynamicModule {
    const optionsProviders = createKratosOptionsProvider(options)
    const exportsProviders = createKratosExportsProvider()
    const providers = createKratosProvider()

    return {
      global: options?.global ?? true,
      module: KratosModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: KratosModuleAsyncOptions): DynamicModule {
    const exportsProviders = createKratosExportsProvider()
    const providers = createKratosProvider()

    return {
      global: options?.global ?? true,
      module: KratosModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: KratosModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: KratosModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: KRATOS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: KRATOS_MODULE_OPTIONS,
      useFactory: (optionsFactory: KratosOptionsFactory) => optionsFactory.createKratosOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
