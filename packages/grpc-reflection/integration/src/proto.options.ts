import path            from 'path'
import { Transport }   from '@nestjs/microservices'
import { GrpcOptions } from '@nestjs/microservices'

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['grpc.reflection.v1alpha', 'test'],
    protoPath: [
      path.join(__dirname, '../../proto/grpc/reflection/v1alpha/reflection.proto'),
      path.join(__dirname, 'test1_service.proto'),
      path.join(__dirname, 'test2_service.proto'),
    ],
    url: '0.0.0.0:50051',
    loader: {
      arrays: true,
      keepCase: false,
      defaults: true,
      oneofs: true,
      includeDirs: [],
    },
  },
}
