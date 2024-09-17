import { Provider }                       from '@nestjs/common'

import { GrpcServicesRegistry }           from '../grpc/index.js'
import { GrpcReflector }                  from '../grpc/index.js'
import { GrpcReflectionModuleOptions }    from './grpc-reflection-module-options.interface.js'
import { GRPC_REFLECTION_MODULE_OPTIONS } from './grpc-reflection.constants.js'

export const createGrpcReflectionOptionsProvider = (
  options: GrpcReflectionModuleOptions
): Provider[] => [
  {
    provide: GRPC_REFLECTION_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcReflectionProvider = (): Provider[] => [GrpcReflector, GrpcServicesRegistry]

export const createGrpcReflectionExportsProvider = (): Provider[] => []
