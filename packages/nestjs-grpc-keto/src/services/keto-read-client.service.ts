import type { CheckRequest }      from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb.js'

import { Inject }                 from '@nestjs/common'
import { Injectable }             from '@nestjs/common'

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
