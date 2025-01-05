// @ts-expect-error
import type { RelationTuple }            from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'
// @ts-expect-error
import { RelationTupleDelta }            from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'
// @ts-expect-error
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

  async addRelationTuple(tuple: RelationTuple): Promise<Array<string>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, Action.ACTION_INSERT)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  async deleteRelationTuple(tuple: RelationTuple): Promise<Array<string>> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const relationRequest = new TransactRelationTuplesRequest()

      const delta = this.convertDeltaToTuple(tuple, Action.ACTION_DELETE)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      relationRequest.addRelationTupleDeltas(delta)

      return new Promise((resolve) => {
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.writeServiceClient.transactRelationTuples(relationRequest, (error, response) => {
          if (error) throw error

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          resolve(response.getSnaptokensList())
        })
      })
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  private convertDeltaToTuple(tuple: RelationTuple, action: Action): RelationTupleDelta {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const delta = new RelationTupleDelta()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    delta.setAction(action).setRelationTuple(tuple)

     
    return delta
  }
}
