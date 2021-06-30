import path            from 'path'
import { Transport }   from '@nestjs/microservices'
import { GrpcOptions } from '@nestjs/microservices'

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['test'],
    protoPath: [path.join(__dirname, './test.proto')],
    url: '0.0.0.0:50051',
    loader: {
      arrays: true,
      keepCase: true,
      defaults: true,
      oneofs: true,
      includeDirs: [],
    },
  },
}
