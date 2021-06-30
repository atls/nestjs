import { GrpcOptions }   from '@nestjs/microservices'

import { Authenticator } from '@atls/nestjs-grpc-http-proxy'

export interface GrpcPlaygroundModuleOptions {
  version?: string
  authenticator?: Authenticator
  options: GrpcOptions['options']
}
