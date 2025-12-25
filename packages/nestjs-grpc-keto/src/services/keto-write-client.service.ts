import type { RelationTuple }            from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'
import { RelationTupleDelta }            from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'
import { TransactRelationTuplesRequest } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'

import { KetoGeneralException }          from '../exceptions/index.js'
import { KETO_WRITE_NATIVE_CLIENT }      from '../module/index.js'
import { KetoWriteNativeClientService }  from './keto-write-native-client.service.js'

type RelationTupleDeltaAction =
  (typeof RelationTupleDelta.Action)[keyof typeof RelationTupleDelta.Action]

@Injectable()
export class KetoWriteClientService {
  constructor(
    @Inject(KETO_WRITE_NATIVE_CLIENT)
    private readonly writeServiceClient: KetoWriteNativeClientService
  ) {}

  async addRelationTuple(tuple: RelationTuple): Promise<Array<string>> {
    try {
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, RelationTupleDelta.Action.ACTION_INSERT)

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
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, RelationTupleDelta.Action.ACTION_DELETE)

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
  ): RelationTupleDelta {
    const delta = new RelationTupleDelta()

    delta.setAction(action).setRelationTuple(tuple)

    return delta
  }
}
