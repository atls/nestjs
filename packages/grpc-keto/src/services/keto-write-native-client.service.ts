import { ChannelCredentials }  from '@grpc/grpc-js'
import { Inject }              from '@nestjs/common'
// @ts-ignore
import { WriteServiceClient }  from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_grpc_pb'

import { KetoModuleOptions }   from '../module/index.js'
import { KETO_MODULE_OPTIONS } from '../module/index.js'

export class KetoWriteNativeClientService extends WriteServiceClient {
  constructor(@Inject(KETO_MODULE_OPTIONS) private readonly options: KetoModuleOptions) {
    super(options.write, options.credentials ?? ChannelCredentials.createInsecure())
  }
}
