import { DynamicModule }                       from '@nestjs/common'
import { Module }                              from '@nestjs/common'
import { Provider }                            from '@nestjs/common'

import { GrpcReflectionController }            from '../controllers/index.js'
import { GrpcReflectionModuleAsyncOptions }    from './grpc-reflection-module-options.interface.js'
import { GrpcReflectionModuleOptions }         from './grpc-reflection-module-options.interface.js'
import { GrpcReflectionOptionsFactory }        from './grpc-reflection-module-options.interface.js'
import { GRPC_REFLECTION_MODULE_OPTIONS }      from './grpc-reflection.constants.js'
import { createGrpcReflectionExportsProvider } from './grpc-reflection.providers.js'
import { createGrpcReflectionProvider }        from './grpc-reflection.providers.js'
import { createGrpcReflectionOptionsProvider } from './grpc-reflection.providers.js'

@Module({})
export class GrpcReflectionModule {
  static register(options: GrpcReflectionModuleOptions): DynamicModule {
    const optionsProviders = createGrpcReflectionOptionsProvider(options)
    const exportsProviders = createGrpcReflectionExportsProvider()
    const providers = createGrpcReflectionProvider()

    return {
      module: GrpcReflectionModule,
      providers: [...optionsProviders, ...providers, ...exportsProviders],
      exports: exportsProviders,
      controllers: [GrpcReflectionController],
    }
  }

  static registerAsync(options: GrpcReflectionModuleAsyncOptions): DynamicModule {
    const exportsProviders = createGrpcReflectionExportsProvider()
    const providers = createGrpcReflectionProvider()

    return {
      module: GrpcReflectionModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...providers, ...exportsProviders],
      exports: exportsProviders,
      controllers: [GrpcReflectionController],
    }
  }

  private static createAsyncProviders(options: GrpcReflectionModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: GrpcReflectionModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: GRPC_REFLECTION_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: GRPC_REFLECTION_MODULE_OPTIONS,
      useFactory: (optionsFactory: GrpcReflectionOptionsFactory) =>
        optionsFactory.createGrpcReflectionOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}