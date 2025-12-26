import type { GrpcOptions } from '@nestjs/microservices'

import path                 from 'node:path'
import { fileURLToPath }    from 'node:url'

import { Transport }        from '@nestjs/microservices'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['grpc.reflection.v1', 'test'],
    protoPath: [
      path.join(moduleDir, '../../proto/grpc/reflection/v1/reflection.proto'),
      path.join(moduleDir, 'test1_service.proto'),
      path.join(moduleDir, 'test2_service.proto'),
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
