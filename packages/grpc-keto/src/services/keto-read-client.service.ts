import { Inject }                 from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
// @ts-ignore
import { CheckRequest }           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'

import { KetoGeneralException }   from '../exceptions/index.js'
import { KETO_CHECK_CLIENT }      from '../module/index.js'
import { KetoCheckClientService } from './keto-check-client.service.js'

@Injectable()
export class KetoReadClientService {
  constructor(
    @Inject(KETO_CHECK_CLIENT) private readonly checkServiceClient: KetoCheckClientService
  ) {}

  async validateRelationTuple(checkRequest: CheckRequest): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        // @ts-ignore
        this.checkServiceClient.check(checkRequest, (error, response) => {
          if (error) throw error

          resolve(response.getAllowed())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }
}
