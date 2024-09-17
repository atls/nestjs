import { Provider }                       from '@nestjs/common'

import { AuthenticationService }          from '../authenticators/index.js'
import { ProtoRegistry }                  from '../proto/index.js'
import { GrpcHttpProxyModuleOptions }     from './grpc-http-proxy-module-options.interface.js'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from './grpc-http-proxy.constants.js'

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
