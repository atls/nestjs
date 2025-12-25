/* eslint-disable max-classes-per-file */
declare module '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb' {
  export class SubjectSet {
    setNamespace(value: string): void

    setObject(value: string): void

    setRelation(value: string): void
  }

  export class Subject {
    setId(value: string): void

    setSet(value: SubjectSet): Subject
  }

  export type RelationTuple = Record<string, unknown>
}

declare module '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb' {
  import type { Subject } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

  export class CheckRequest {
    setNamespace(value: string): void

    setObject(value: string): void

    setRelation(value: string): void

    setSubject(value: Subject): void
  }
}

declare module '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_grpc_pb' {
  import type { ChannelCredentials, Client, ServiceError } from '@grpc/grpc-js'
  import type { CheckRequest } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'

  type CheckResponse = {
    getAllowed: () => boolean
  }

  export class CheckServiceClient extends Client {
    constructor(address: string, creds: ChannelCredentials)

    check(
      request: CheckRequest,
      callback: (error: ServiceError | null, response: CheckResponse) => void
    ): void
  }
}

declare module '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb' {
  import type { RelationTuple } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

  export class RelationTupleDelta {
    static Action: {
      ACTION_INSERT: number
      ACTION_DELETE: number
    }

    setAction(action: number): RelationTupleDelta

    setRelationTuple(tuple: RelationTuple): RelationTupleDelta
  }

  export class TransactRelationTuplesRequest {
    addRelationTupleDeltas(delta: RelationTupleDelta): void
  }

  export class TransactRelationTuplesResponse {
    getSnaptokensList(): Array<string>
  }
}

declare module '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_grpc_pb' {
  import type { ChannelCredentials, Client, ServiceError } from '@grpc/grpc-js'
  import type {
    TransactRelationTuplesRequest,
    TransactRelationTuplesResponse,
  } from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/write_service_pb'

  export class WriteServiceClient extends Client {
    constructor(address: string, creds: ChannelCredentials)

    transactRelationTuples(
      request: TransactRelationTuplesRequest,
      callback: (error: ServiceError | null, response: TransactRelationTuplesResponse) => void
    ): void
  }
}
