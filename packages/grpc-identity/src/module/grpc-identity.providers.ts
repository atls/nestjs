import { Provider }                     from '@nestjs/common'
import { JwksClient }                   from 'jwks-rsa'

import { GrpcIdentityModuleOptions }    from './grpc-identity-module.interface'
import { GRPC_IDENTITY_MODULE_OPTIONS } from './grpc-identity.constants'
import { JwtVerifier }                  from '../jwt'

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
