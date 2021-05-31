import { DynamicModule, Module, Provider }       from '@nestjs/common'

import { ExternalRendererModuleAsyncOptions }    from './external-renderer-module-options.interface'
import { ExternalRendererModuleOptions }         from './external-renderer-module-options.interface'
import { ExternalRendererOptionsFactory }        from './external-renderer-module-options.interface'
import { EXTERNAL_RENDERER_MODULE_OPTIONS }      from './external-renderer.constants'
import { createExternalRendererExportsProvider } from './external-renderer.providers'
import { createExternalRendererProvider }        from './external-renderer.providers'
import { createExternalRendererOptionsProvider } from './external-renderer.providers'

@Module({})
export class ExternalRendererModule {
  static register(options: ExternalRendererModuleOptions): DynamicModule {
    const optionsProviders = createExternalRendererOptionsProvider(options)
    const exportsProviders = createExternalRendererExportsProvider()
    const providers = createExternalRendererProvider()

    return {
      module: ExternalRendererModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: ExternalRendererModuleAsyncOptions): DynamicModule {
    const exportsProviders = createExternalRendererExportsProvider()
    const providers = createExternalRendererProvider()

    return {
      module: ExternalRendererModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: ExternalRendererModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: ExternalRendererModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: EXTERNAL_RENDERER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: EXTERNAL_RENDERER_MODULE_OPTIONS,
      useFactory: (optionsFactory: ExternalRendererOptionsFactory) =>
        optionsFactory.createExternalRendererOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
