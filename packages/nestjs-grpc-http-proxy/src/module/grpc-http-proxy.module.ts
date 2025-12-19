import type { DynamicModule }                   from '@nestjs/common'
import type { Provider }                        from '@nestjs/common'

import type { GrpcHttpProxyModuleAsyncOptions } from './grpc-http-proxy-module-options.interface.js'
import type { GrpcHttpProxyModuleOptions }      from './grpc-http-proxy-module-options.interface.js'
import type { GrpcHttpProxyOptionsFactory }     from './grpc-http-proxy-module-options.interface.js'

import { Module }                               from '@nestjs/common'

import { GrpcHttpProxyController }              from '../controllers/index.js'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS }       from './grpc-http-proxy.constants.js'
import { createGrpcHttpProxyExportsProvider }   from './grpc-http-proxy.providers.js'
import { createGrpcHttpProxyProvider }          from './grpc-http-proxy.providers.js'
import { createGrpcHttpProxyOptionsProvider }   from './grpc-http-proxy.providers.js'

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

  private static createAsyncProviders(options: GrpcHttpProxyModuleAsyncOptions): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    if (!options.useClass) {
      throw new Error(
        'GrpcHttpProxyModule requires useClass when useExisting/useFactory not provided'
      )
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
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

    const injectTarget = options.useExisting ?? options.useClass
    if (!injectTarget) {
      throw new Error('GrpcHttpProxyModule requires useExisting, useClass, or useFactory')
    }

    return {
      provide: GRPC_HTTP_PROXY_MODULE_OPTIONS,
      useFactory: async (optionsFactory: GrpcHttpProxyOptionsFactory) =>
        optionsFactory.createGrpcHttpProxyOptions(),
      inject: [injectTarget],
    }
  }
}
