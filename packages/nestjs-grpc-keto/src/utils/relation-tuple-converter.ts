// @ts-expect-error
import { CheckRequest }                      from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'
// @ts-expect-error
import { SubjectSet }                        from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'
// @ts-expect-error
import { Subject }                           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { KetoRelationTupleInvalidException } from '../exceptions/index.js'

type Tuple = string | ((...args: Array<string>) => string)

export class RelationTupleConverter {
  private readonly checkRequest: CheckRequest

  private tupleString: string

  constructor(
    private readonly tuple: Tuple,
    private readonly replacement: string = ''
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.checkRequest = new CheckRequest()

    this.convertToString()
  }

  private get subjectId(): string {
    return this.tupleString
  }

  private get subject(): Subject {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new Subject()
  }

  run(): CheckRequest {
    if (!this.isTupleCorrect()) {
      throw new KetoRelationTupleInvalidException()
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.checkRequest.setNamespace(this.getNamespace())
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.checkRequest.setObject(this.getObject())
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.checkRequest.setRelation(this.getRelation())

    const { subject } = this

    if (this.isSubjectSet()) {
      const subjectSet = this.getSubjectSet()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.checkRequest.setSubject(subject.setSet(subjectSet))
    } else {
      const { subjectId } = this
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      subject.setId(subjectId)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const subjectSet = new SubjectSet()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    subjectSet.setNamespace(namespace)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    subjectSet.setObject(object)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    subjectSet.setRelation(relation)

     
    return subjectSet
  }

  private isSubjectSet(): boolean {
    return this.tupleString.includes(':') || this.tupleString.includes('#')
  }
}
