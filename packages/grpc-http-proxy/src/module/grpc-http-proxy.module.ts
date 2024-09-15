import { DynamicModule }                      from '@nestjs/common'
import { Module }                             from '@nestjs/common'
import { Provider }                           from '@nestjs/common'

import { GrpcHttpProxyController }            from '../controllers/index.js'
import { GrpcHttpProxyModuleAsyncOptions }    from './grpc-http-proxy-module-options.interface.js'
import { GrpcHttpProxyModuleOptions }         from './grpc-http-proxy-module-options.interface.js'
import { GrpcHttpProxyOptionsFactory }        from './grpc-http-proxy-module-options.interface.js'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS }     from './grpc-http-proxy.constants.js'
import { createGrpcHttpProxyExportsProvider } from './grpc-http-proxy.providers.js'
import { createGrpcHttpProxyProvider }        from './grpc-http-proxy.providers.js'
import { createGrpcHttpProxyOptionsProvider } from './grpc-http-proxy.providers.js'

@Module({})
export class GrpcHttpProxyModule {
  static register(options: GrpcHttpProxyModuleOptions): DynamicModule {
    const optionsProviders = createGrpcHttpProxyOptionsProvider(options)
    const exportsProviders = createGrpcHttpProxyExportsProvider()
    const providers = createGrpcHttpProxyProvider()

    return {
      module: GrpcHttpProxyModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
      controllers: [GrpcHttpProxyController],
    }
  }

  static registerAsync(options: GrpcHttpProxyModuleAsyncOptions): DynamicModule {
    const exportsProviders = createGrpcHttpProxyExportsProvider()
    const providers = createGrpcHttpProxyProvider()

    return {
      module: GrpcHttpProxyModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
      controllers: [GrpcHttpProxyController],
    }
  }

  private static createAsyncProviders(options: GrpcHttpProxyModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: GrpcHttpProxyModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GRPC_HTTP_PROXY_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: GRPC_HTTP_PROXY_MODULE_OPTIONS,
      useFactory: (optionsFactory: GrpcHttpProxyOptionsFactory) =>
        optionsFactory.createGrpcHttpProxyOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
