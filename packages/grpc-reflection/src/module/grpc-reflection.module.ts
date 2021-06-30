import { DynamicModule, Module, Provider }     from '@nestjs/common'

import { GrpcReflectionModuleAsyncOptions }    from './grpc-reflection-module-options.interface'
import { GrpcReflectionModuleOptions }         from './grpc-reflection-module-options.interface'
import { GrpcReflectionOptionsFactory }        from './grpc-reflection-module-options.interface'
import { GRPC_REFLECTION_MODULE_OPTIONS }      from './grpc-reflection.constants'
import { createGrpcReflectionExportsProvider } from './grpc-reflection.providers'
import { createGrpcReflectionProvider }        from './grpc-reflection.providers'
import { createGrpcReflectionOptionsProvider } from './grpc-reflection.providers'
import { GrpcReflectionController }            from '../controllers'

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
