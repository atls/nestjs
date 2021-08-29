// eslint-disable-next-line
/// <reference path='./proto.d.ts'/>

import { Transport }   from '@nestjs/microservices'
import { GrpcOptions } from '@nestjs/microservices'

import reflection      from '@atls/nestjs-grpc-reflection/proto/grpc/reflection/v1alpha/reflection.proto'
import echo            from '../proto/examples/echo/v1/echo.proto'

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['grpc.reflection.v1alpha', 'examples.echo.v1'],
    protoPath: [reflection, echo],
    url: '0.0.0.0:50051',
    loader: {
      arrays: true,
      keepCase: false,
      defaults: true,
      oneofs: true,
    },
  },
}
