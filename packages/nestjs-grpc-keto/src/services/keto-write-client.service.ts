import type { RelationTuple }           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'
import writeService                     from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb.js'

import { KetoGeneralException }         from '../exceptions/index.js'
import { KETO_WRITE_NATIVE_CLIENT }     from '../module/index.js'
import { KetoWriteNativeClientService } from './keto-write-native-client.service.js'

type RelationTupleDeltaAction =
  (typeof writeService.RelationTupleDelta.Action)[keyof typeof writeService.RelationTupleDelta.Action]

@Injectable()
export class KetoWriteClientService {
  constructor(
    @Inject(KETO_WRITE_NATIVE_CLIENT)
    private readonly writeServiceClient: KetoWriteNativeClientService
  ) {}

  async addRelationTuple(tuple: RelationTuple): Promise<Array<string>> {
    try {
      const relationRequest = new writeService.TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(
        tuple,
        writeService.RelationTupleDelta.Action.ACTION_INSERT
      )

      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  async deleteRelationTuple(tuple: RelationTuple): Promise<Array<string>> {
    try {
      const relationRequest = new writeService.TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(
        tuple,
        writeService.RelationTupleDelta.Action.ACTION_DELETE
      )

      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  private convertDeltaToTuple(
    tuple: RelationTuple,
    action: RelationTupleDeltaAction
  ): writeService.RelationTupleDelta {
    const delta = new writeService.RelationTupleDelta()

    delta.setAction(action).setRelationTuple(tuple)

    return delta
  }
}
