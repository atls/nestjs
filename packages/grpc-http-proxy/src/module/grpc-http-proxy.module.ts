import { DynamicModule, Module, Provider }    from '@nestjs/common'

import { GrpcHttpProxyModuleAsyncOptions }    from './grpc-http-proxy-module-options.interface'
import { GrpcHttpProxyModuleOptions }         from './grpc-http-proxy-module-options.interface'
import { GrpcHttpProxyOptionsFactory }        from './grpc-http-proxy-module-options.interface'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS }     from './grpc-http-proxy.constants'
import { createGrpcHttpProxyExportsProvider } from './grpc-http-proxy.providers'
import { createGrpcHttpProxyProvider }        from './grpc-http-proxy.providers'
import { createGrpcHttpProxyOptionsProvider } from './grpc-http-proxy.providers'
import { GrpcHttpProxyController }            from '../controllers'

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
