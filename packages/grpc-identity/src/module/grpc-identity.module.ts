import { DynamicModule, Module, Provider }   from '@nestjs/common'

import { GrpcIdentityModuleAsyncOptions }    from './grpc-identity-module.interface'
import { GrpcIdentityModuleOptions }         from './grpc-identity-module.interface'
import { GrpcIdentityOptionsFactory }        from './grpc-identity-module.interface'
import { GRPC_IDENTITY_MODULE_OPTIONS }      from './grpc-identity.constants'
import { createGrpcIdentityExportsProvider } from './grpc-identity.providers'
import { createGrpcIdentityProvider }        from './grpc-identity.providers'
import { createGrpcIdentityOptionsProvider } from './grpc-identity.providers'

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

  private static createAsyncProviders(options: GrpcIdentityModuleAsyncOptions): Provider[] {
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
      useFactory: (optionsFactory: GrpcIdentityOptionsFactory) =>
        optionsFactory.createGrpcIdentityOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
