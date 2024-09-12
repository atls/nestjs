import { Provider }                       from '@nestjs/common'

import { GrpcServicesRegistry }           from '../grpc'
import { GrpcReflector }                  from '../grpc'
import { GrpcReflectionModuleOptions }    from './grpc-reflection-module-options.interface'
import { GRPC_REFLECTION_MODULE_OPTIONS } from './grpc-reflection.constants'

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
