import { Metadata }         from '@grpc/grpc-js'
/* eslint-disable */
import { GrpcMethod }       from '@nestjs/microservices'
import { GrpcStreamMethod } from '@nestjs/microservices'
// @ts-ignore
import { Observable }       from 'rxjs'
import Long                 from 'long'
import _m0                  from 'protobufjs/minimal.js'

export const protobufPackage = 'examples.echo.v1'

export interface EchoRequest {
  ping: boolean
}

export interface EchoResponse {
  pong: boolean
}

export const EXAMPLES_ECHO_V1_PACKAGE_NAME = 'examples.echo.v1'

export interface EchoServiceClient {
  echo(request: EchoRequest, metadata?: Metadata): Observable<EchoResponse>
}

export interface EchoServiceController {
  echo(
    request: EchoRequest,
    metadata?: Metadata
  ): Promise<EchoResponse> | Observable<EchoResponse> | EchoResponse
}

export function EchoServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['echo']
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcMethod('EchoService', method)(constructor.prototype[method], method, descriptor)
    }
    const grpcStreamMethods: string[] = []
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method)
      GrpcStreamMethod('EchoService', method)(constructor.prototype[method], method, descriptor)
    }
  }
}

export const ECHO_SERVICE_NAME = 'EchoService'

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}
