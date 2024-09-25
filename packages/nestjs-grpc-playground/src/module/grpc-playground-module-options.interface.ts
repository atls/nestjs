import type { Authenticator } from '@atls/nestjs-grpc-http-proxy'
import type { GrpcOptions }   from '@nestjs/microservices'

export interface GrpcPlaygroundModuleOptions {
  version?: string
  authenticator?: Authenticator
  options: GrpcOptions['options']
}
