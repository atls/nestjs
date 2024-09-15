import { SubjectSet }                        from '@ory/keto-client'

import { KetoRelationTupleInvalidException } from '../exceptions/index.js'
import { RelationShipTupleWithSet }          from '../module/index.js'
import { RelationShipTupleWithId }           from '../module/index.js'
import { RelationShipTuple }                 from '../module/index.js'

type Tuple = string | ((...args: string[]) => string)

export class RelationTupleConverter {
  private tupleString: string

  private result: RelationShipTuple

  constructor(
    private readonly tuple: Tuple,
    private readonly replacement: string = ''
  ) {
    this.convertToString()
  }

  private get subjectId() {
    return this.tupleString
  }

  run() {
    if (!this.isTupleCorrect()) {
      throw new KetoRelationTupleInvalidException()
    }

    const namespace = this.getNamespace()
    const object = this.getObject()
    const relation = this.getRelation()

    if (this.isSubjectSet()) {
      const subjectSet = this.getSubjectSet()

      this.result = this.result as RelationShipTupleWithSet

      this.result = {
        namespace,
        object,
        relation,
        subject_set: subjectSet,
      }
    } else {
      const { subjectId } = this

      this.result = this.result as RelationShipTupleWithId

      this.result = {
        namespace,
        object,
        relation,
        subject_id: subjectId,
      }
    }

    return this.result
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

    const subjectSet: SubjectSet = {
      namespace,
      object,
      relation,
    }

    return subjectSet
  }

  private isSubjectSet() {
    return this.tupleString.includes(':') || this.tupleString.includes('#')
  }
}
