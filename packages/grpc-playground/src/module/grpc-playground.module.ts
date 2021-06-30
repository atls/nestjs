import { DynamicModule, Module }          from '@nestjs/common'

import { GrpcHttpProxyModule }            from '@atls/nestjs-grpc-http-proxy'
import { GrpcReflectionModule }           from '@atls/nestjs-grpc-reflection'

import { GrpcPlaygroundModuleOptions }    from './grpc-playground-module-options.interface'
import { GRPC_PLAYGROUND_MODULE_OPTIONS } from './grpc-playground.constants'
import { GrpcPlaygroundController }       from '../controllers'

@Module({})
export class GrpcPlaygroundModule {
  static register(options: GrpcPlaygroundModuleOptions): DynamicModule {
    return {
      module: GrpcPlaygroundModule,
      imports: [
        GrpcReflectionModule.register(options.options),
        GrpcHttpProxyModule.register({
          authenticator: options.authenticator,
          options: options.options,
        }),
      ],
      providers: [
        {
          provide: GRPC_PLAYGROUND_MODULE_OPTIONS,
          useValue: {
            ...options,
            version: options.version || '0.0.1',
          },
        },
      ],
      controllers: [GrpcPlaygroundController],
    }
  }
}
