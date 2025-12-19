import { ChannelCredentials }  from '@grpc/grpc-js'
import { Inject }              from '@nestjs/common'
import { Injectable }          from '@nestjs/common'
import { CheckServiceClient }  from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_grpc_pb'

import { KetoModuleOptions }   from '../module/index.js'
import { KETO_MODULE_OPTIONS } from '../module/index.js'

@Injectable()
export class KetoCheckClientService extends CheckServiceClient {
  constructor(@Inject(KETO_MODULE_OPTIONS) private readonly options: KetoModuleOptions) {
    super(options.read, options.credentials ?? ChannelCredentials.createInsecure())
  }
}
