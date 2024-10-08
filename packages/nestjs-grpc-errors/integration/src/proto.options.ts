import type { GrpcOptions } from '@nestjs/microservices'

import { Transport }        from '@nestjs/microservices'
import path                 from 'path'

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
