import type { CheckRequest }                 from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'
import type { Subject }                      from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'
import type { SubjectSet }                   from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import checkService                          from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb.js'
import relationTuples                        from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb.js'

import { KetoRelationTupleInvalidException } from '../exceptions/index.js'

type Tuple = string | ((...args: Array<string>) => string)

export class RelationTupleConverter {
  private readonly checkRequest: CheckRequest

  private tupleString: string

  constructor(
    private readonly tuple: Tuple,
    private readonly replacement: string = ''
  ) {
    this.checkRequest = new checkService.CheckRequest()

    this.convertToString()
  }

  private get subjectId(): string {
    return this.tupleString
  }

  private get subject(): Subject {
    return new relationTuples.Subject()
  }

  run(): CheckRequest {
    if (!this.isTupleCorrect()) {
      throw new KetoRelationTupleInvalidException()
    }

    this.checkRequest.setNamespace(this.getNamespace())

    this.checkRequest.setObject(this.getObject())

    this.checkRequest.setRelation(this.getRelation())

    const { subject } = this

    if (this.isSubjectSet()) {
      const subjectSet = this.getSubjectSet()

      this.checkRequest.setSubject(subject.setSet(subjectSet))
    } else {
      const { subjectId } = this

      subject.setId(subjectId)

      this.checkRequest.setSubject(subject)
    }

    return this.checkRequest
  }

  private convertToString(): void {
    if (typeof this.tuple === 'string') {
      this.tupleString = this.tuple
    } else {
      this.tupleString = this.tuple(this.replacement)
    }
  }

  private isTupleCorrect(): boolean {
    const regex = /^\w+:\w+#\w+@[\w\W]+/i

    return regex.test(this.tupleString)
  }

  private getNamespace(): string {
    const endOfNamespace = this.tupleString.indexOf(':')

    const namespace = this.tupleString.substring(0, endOfNamespace)

    this.tupleString = this.tupleString.slice(endOfNamespace + 1)

    return namespace
  }

  private getObject(): string {
    const endOfObject = this.tupleString.indexOf('#')

    const object = this.tupleString.substring(0, endOfObject)

    this.tupleString = this.tupleString.slice(endOfObject + 1)

    return object
  }

  private getRelation(): string {
    const endOfRelation = this.tupleString.indexOf('@')

    const relation = this.tupleString.substring(0, endOfRelation > 0 ? endOfRelation : undefined)

    this.tupleString = this.tupleString.slice(endOfRelation + 1)

    return relation
  }

  private getSubjectSet(): SubjectSet {
    const namespace = this.getNamespace()
    const object = this.getObject()
    const relation = this.getRelation()

    const subjectSet = new relationTuples.SubjectSet()

    subjectSet.setNamespace(namespace)

    subjectSet.setObject(object)

    subjectSet.setRelation(relation)

    return subjectSet
  }

  private isSubjectSet(): boolean {
    return this.tupleString.includes(':') || this.tupleString.includes('#')
  }
}
