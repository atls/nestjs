import type { DynamicModule }                  from '@nestjs/common'
import type { Provider }                       from '@nestjs/common'

import type { GrpcIdentityModuleAsyncOptions } from './grpc-identity-module.interface.js'
import type { GrpcIdentityModuleOptions }      from './grpc-identity-module.interface.js'
import type { GrpcIdentityOptionsFactory }     from './grpc-identity-module.interface.js'

import { Module }                              from '@nestjs/common'

import { GRPC_IDENTITY_MODULE_OPTIONS }        from './grpc-identity.constants.js'
import { createGrpcIdentityExportsProvider }   from './grpc-identity.providers.js'
import { createGrpcIdentityProvider }          from './grpc-identity.providers.js'
import { createGrpcIdentityOptionsProvider }   from './grpc-identity.providers.js'

@Module({})
export class GrpcIdentityModule {
  static register(options: GrpcIdentityModuleOptions): DynamicModule {
    const optionsProviders = createGrpcIdentityOptionsProvider(options)
    const exportsProviders = createGrpcIdentityExportsProvider()
    const providers = createGrpcIdentityProvider()

    return {
      module: GrpcIdentityModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: GrpcIdentityModuleAsyncOptions): DynamicModule {
    const exportsProviders = createGrpcIdentityExportsProvider()
    const providers = createGrpcIdentityProvider()

    return {
      module: GrpcIdentityModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: GrpcIdentityModuleAsyncOptions): Array<Provider> {
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

  private static createAsyncOptionsProvider(options: GrpcIdentityModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GRPC_IDENTITY_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: GRPC_IDENTITY_MODULE_OPTIONS,
      useFactory: async (optionsFactory: GrpcIdentityOptionsFactory) =>
        optionsFactory.createGrpcIdentityOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
