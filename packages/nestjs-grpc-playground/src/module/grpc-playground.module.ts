import type { DynamicModule }               from '@nestjs/common'

import type { GrpcPlaygroundModuleOptions } from './grpc-playground-module-options.interface.js'

import { Module }                           from '@nestjs/common'

import { GrpcHttpProxyModule }              from '@atls/nestjs-grpc-http-proxy'
import { GrpcReflectionModule }             from '@atls/nestjs-grpc-reflection'

import { GrpcPlaygroundController }         from '../controllers/index.js'
import { GRPC_PLAYGROUND_MODULE_OPTIONS }   from './grpc-playground.constants.js'

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
            version: options.version || '0.0.8',
          },
        },
      ],
      controllers: [GrpcPlaygroundController],
    }
  }
}
