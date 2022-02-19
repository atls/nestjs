import { DynamicModule }                from '@nestjs/common'
import { Module }                       from '@nestjs/common'
import { Provider }                     from '@nestjs/common'
import { DiscoveryModule }              from '@nestjs/core'

import { GatewayModuleAsyncOptions }    from './gateway-module-options.interface'
import { GatewayModuleOptions }         from './gateway-module-options.interface'
import { GatewayOptionsFactory }        from './gateway-module-options.interface'
import { GATEWAY_MODULE_OPTIONS }       from './gateway.constants'
import { createGatewayExportsProvider } from './gateway.providers'
import { createGatewayProvider }        from './gateway.providers'
import { createGatewayOptionsProvider } from './gateway.providers'

@Module({
  imports: [DiscoveryModule],
})
export class GatewayModule {
  static register(options: GatewayModuleOptions = {}): DynamicModule {
    const optionsProviders = createGatewayOptionsProvider(options)
    const exportsProviders = createGatewayExportsProvider()
    const providers = createGatewayProvider()

    return {
      module: GatewayModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: GatewayModuleAsyncOptions = {}): DynamicModule {
    const exportsProviders = createGatewayExportsProvider()
    const providers = createGatewayProvider()

    return {
      module: GatewayModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: GatewayModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: GatewayModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GATEWAY_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: GATEWAY_MODULE_OPTIONS,
      useFactory: (optionsFactory: GatewayOptionsFactory) => optionsFactory.createGatewayOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
