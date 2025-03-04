/// <reference path='./proto.d.ts'/>

import type { GrpcOptions } from '@nestjs/microservices'

import { Transport }        from '@nestjs/microservices'

import reflection           from '@atls/nestjs-grpc-reflection/proto/grpc/reflection/v1alpha/reflection.proto'

import playground           from '../proto/examples/playground/v1/playground.proto'

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['grpc.reflection.v1', 'examples.playground.v1'],
    protoPath: [reflection, playground],
    url: '0.0.0.0:50051',
    loader: {
      arrays: true,
      keepCase: false,
      defaults: true,
      oneofs: true,
    },
  },
}
