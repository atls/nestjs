import { Inject }                 from '@nestjs/common'
import { Injectable }             from '@nestjs/common'
import { CheckRequest }           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'

import { KetoGeneralException }   from '../exceptions'
import { KETO_CHECK_CLIENT }      from '../module'
import { KetoCheckClientService } from './keto-check-client.service'

@Injectable()
export class KetoReadClientService {
  constructor(
    @Inject(KETO_CHECK_CLIENT) private readonly checkServiceClient: KetoCheckClientService
  ) {}

  async validateRelationTuple(checkRequest: CheckRequest): Promise<boolean> {
    try {
      return new Promise((resolve) => {
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
