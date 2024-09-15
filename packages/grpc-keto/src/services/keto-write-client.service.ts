import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'
// @ts-ignore
import { RelationTuple }                 from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'
// @ts-ignore
import { RelationTupleDelta }            from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'
// @ts-ignore
import { TransactRelationTuplesRequest } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'

import { KetoGeneralException }          from '../exceptions/index.js'
import { KETO_WRITE_NATIVE_CLIENT }      from '../module/index.js'
import { KetoWriteNativeClientService }  from './keto-write-native-client.service.js'

import Action = RelationTupleDelta.Action

@Injectable()
export class KetoWriteClientService {
  constructor(
    @Inject(KETO_WRITE_NATIVE_CLIENT)
    private readonly writeServiceClient: KetoWriteNativeClientService
  ) {}

  async addRelationTuple(tuple: RelationTuple): Promise<string[]> {
    try {
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, Action.ACTION_INSERT)

      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        // @ts-ignore
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          return resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  async deleteRelationTuple(tuple: RelationTuple): Promise<string[]> {
    try {
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, Action.ACTION_DELETE)

      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        // @ts-ignore
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          return resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  private convertDeltaToTuple(tuple: RelationTuple, action: Action): RelationTupleDelta {
    const delta = new RelationTupleDelta()

    delta.setAction(action).setRelationTuple(tuple)

    return delta
  }
}
