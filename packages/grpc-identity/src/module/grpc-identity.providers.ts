import { Provider }                     from '@nestjs/common'
import { JwksClient }                   from 'jwks-rsa'

import { JwtVerifier }                  from '../jwt/index.js'
import { GrpcIdentityModuleOptions }    from './grpc-identity-module.interface.js'
import { GRPC_IDENTITY_MODULE_OPTIONS } from './grpc-identity.constants.js'

export const createGrpcIdentityOptionsProvider = (
  options: GrpcIdentityModuleOptions
): Provider[] => [
  {
    provide: GRPC_IDENTITY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGrpcIdentityProvider = (): Provider[] => []

export const createGrpcIdentityExportsProvider = (): Provider[] => [
  JwtVerifier,
  {
    provide: JwksClient,
    useFactory: (options: GrpcIdentityModuleOptions) => new JwksClient(options.jwks),
    inject: [GRPC_IDENTITY_MODULE_OPTIONS],
  },
]
