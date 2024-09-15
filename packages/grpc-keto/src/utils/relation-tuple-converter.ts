// @ts-ignore
import { CheckRequest }                      from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'
// @ts-ignore
import { SubjectSet }                        from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'
// @ts-ignore
import { Subject }                           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { KetoRelationTupleInvalidException } from '../exceptions/index.js'

type Tuple = string | ((...args: string[]) => string)

export class RelationTupleConverter {
  private readonly checkRequest: CheckRequest

  private tupleString: string

  constructor(
    private readonly tuple: Tuple,
    private readonly replacement: string = ''
  ) {
    this.checkRequest = new CheckRequest()

    this.convertToString()
  }

  private get subjectId() {
    return this.tupleString
  }

  private get subject() {
    return new Subject()
  }

  run() {
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

  private convertToString() {
    if (typeof this.tuple === 'string') {
      this.tupleString = this.tuple
    } else {
      this.tupleString = this.tuple(this.replacement)
    }
  }

  private isTupleCorrect() {
    const regex = /^\w+:\w+#\w+@[\w\W]+/i

    return regex.test(this.tupleString)
  }

  private getNamespace() {
    const endOfNamespace = this.tupleString.indexOf(':')

    const namespace = this.tupleString.substring(0, endOfNamespace)

    this.tupleString = this.tupleString.slice(endOfNamespace + 1)

    return namespace
  }

  private getObject() {
    const endOfObject = this.tupleString.indexOf('#')

    const object = this.tupleString.substring(0, endOfObject)

    this.tupleString = this.tupleString.slice(endOfObject + 1)

    return object
  }

  private getRelation() {
    const endOfRelation = this.tupleString.indexOf('@')

    const relation = this.tupleString.substring(0, endOfRelation > 0 ? endOfRelation : undefined)

    this.tupleString = this.tupleString.slice(endOfRelation + 1)

    return relation
  }

  private getSubjectSet() {
    const namespace = this.getNamespace()
    const object = this.getObject()
    const relation = this.getRelation()

    const subjectSet = new SubjectSet()

    subjectSet.setNamespace(namespace)
    subjectSet.setObject(object)
    subjectSet.setRelation(relation)

    return subjectSet
  }

  private isSubjectSet() {
    return this.tupleString.includes(':') || this.tupleString.includes('#')
  }
}
