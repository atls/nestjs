import type { Provider }                    from '@nestjs/common'

import type { GrpcReflectionModuleOptions } from './grpc-reflection-module-options.interface.js'

import { GrpcServicesRegistry }             from '../grpc/index.js'
import { GrpcReflector }                    from '../grpc/index.js'
import { GRPC_REFLECTION_MODULE_OPTIONS }   from './grpc-reflection.constants.js'

export const createGrpcReflectionOptionsProvider = (
  options: GrpcReflectionModuleOptions
): Array<Provider> => [
  {
    provide: GRPC_REFLECTION_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcReflectionProvider = (): Array<Provider> => [
  GrpcReflector,
  GrpcServicesRegistry,
]

export const createGrpcReflectionExportsProvider = (): Array<Provider> => []
