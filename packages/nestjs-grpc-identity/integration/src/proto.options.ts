import type { GrpcOptions } from '@nestjs/microservices'

import path                 from 'node:path'
import { fileURLToPath }    from 'node:url'

import { Transport }        from '@nestjs/microservices'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

export const serverOptions: GrpcOptions = {
  transport: Transport.GRPC,
  options: {
    package: ['test'],
    protoPath: [path.join(moduleDir, './test.proto')],
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
