import type { Provider }                  from '@nestjs/common'

import type { GrpcIdentityModuleOptions } from './grpc-identity-module.interface.js'

import { JwksClient }                     from 'jwks-rsa'

import { JwtVerifier }                    from '../jwt/index.js'
import { GRPC_IDENTITY_MODULE_OPTIONS }   from './grpc-identity.constants.js'

export const createGrpcIdentityOptionsProvider = (
  options: GrpcIdentityModuleOptions
): Array<Provider> => [
  {
    provide: GRPC_IDENTITY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcIdentityProvider = (): Array<Provider> => []

export const createGrpcIdentityExportsProvider = (): Array<Provider> => [
  JwtVerifier,
  {
    provide: JwksClient,
    useFactory: (options: GrpcIdentityModuleOptions) => new JwksClient(options.jwks),
    inject: [GRPC_IDENTITY_MODULE_OPTIONS],
  },
]
