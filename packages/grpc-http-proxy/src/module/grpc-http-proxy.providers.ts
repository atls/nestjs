import { Provider }                       from '@nestjs/common'

import { GrpcHttpProxyModuleOptions }     from './grpc-http-proxy-module-options.interface'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from './grpc-http-proxy.constants'
import { AuthenticationService }          from '../authenticators'
import { ProtoRegistry }                  from '../proto'

export const createGrpcHttpProxyOptionsProvider = (
  options: GrpcHttpProxyModuleOptions
): Provider[] => [
  {
    provide: GRPC_HTTP_PROXY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcHttpProxyProvider = (): Provider[] => [ProtoRegistry, AuthenticationService]

export const createGrpcHttpProxyExportsProvider = (): Provider[] => []
