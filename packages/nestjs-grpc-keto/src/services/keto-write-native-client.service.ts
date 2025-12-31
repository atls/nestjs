import type { ChannelCredentials } from '@grpc/grpc-js'
import type { credentials }        from '@grpc/grpc-js'

import type { KetoModuleOptions }  from '../module/index.js'

import { createRequire }           from 'node:module'

import * as writeService           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_grpc_pb.js'
import { Inject }                  from '@nestjs/common'
import { Injectable }              from '@nestjs/common'

import { KETO_MODULE_OPTIONS }     from '../module/index.js'

const require = createRequire(import.meta.url)
const writeServicePath = require.resolve(
  '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_grpc_pb.js'
)
const oryGrpc = createRequire(writeServicePath)('@grpc/grpc-js') as {
  ChannelCredentials: typeof ChannelCredentials
  credentials: typeof credentials
}

const resolveCredentials = (value?: unknown) => {
  if (value instanceof oryGrpc.ChannelCredentials) {
    return value
  }

  return oryGrpc.credentials.createInsecure()
}

@Injectable()
export class KetoWriteNativeClientService extends writeService.WriteServiceClient {
  constructor(@Inject(KETO_MODULE_OPTIONS) private readonly options: KetoModuleOptions) {
    super(options.write, resolveCredentials(options.credentials))
  }
}
