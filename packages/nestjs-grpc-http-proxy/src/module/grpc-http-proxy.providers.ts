import type { Provider }                   from '@nestjs/common'

import type { GrpcHttpProxyModuleOptions } from './grpc-http-proxy-module-options.interface.js'

import { AuthenticationService }           from '../authenticators/index.js'
import { ProtoRegistry }                   from '../proto/index.js'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS }  from './grpc-http-proxy.constants.js'

export const createGrpcHttpProxyOptionsProvider = (
  options: GrpcHttpProxyModuleOptions
): Array<Provider> => [
  {
    provide: GRPC_HTTP_PROXY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcHttpProxyProvider = (): Array<Provider> => [
  ProtoRegistry,
  AuthenticationService,
]

export const createGrpcHttpProxyExportsProvider = (): Array<Provider> => []
