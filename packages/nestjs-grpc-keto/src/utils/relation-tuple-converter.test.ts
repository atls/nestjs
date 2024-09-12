// @ts-ignore
import { CheckRequest }           from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/check_service_pb'
// @ts-ignore
import { SubjectSet }             from '@ory/keto-grpc-client/ory/keto/relation_tuples/v1alpha2/relation_tuples_pb'

import { RelationTupleConverter } from './relation-tuple-converter.js'
import {describe, expect, it, beforeAll} from '@jest/globals'

describe('Keto relation tuple converter', () => {
  let stringConverter: RelationTupleConverter
  let functionConverter: RelationTupleConverter
  let stringConverterSubjectSet: RelationTupleConverter
  let invalidTupleConverter: RelationTupleConverter

  beforeAll(() => {
    stringConverter = new RelationTupleConverter(
      'testNamespace:testObject#testRelation@testSubject'
    )
    functionConverter = new RelationTupleConverter(
      (test) => `testNamespace:testObject#testRelation@${test}`,
      'testSubject'
    )
    stringConverterSubjectSet = new RelationTupleConverter(
      'testNamespace:testObject#testRelation@testSubjectNamespace:testSubjectObject#testSubjectRelation'
    )

    invalidTupleConverter = new RelationTupleConverter('testNamespace#testObject')
  })

  it('accepts either string or function', () => {
    expect(stringConverter).toBeTruthy()
    expect(functionConverter).toBeTruthy()
  })

  it('throws if tuple is invalid', () => {
    expect(() => invalidTupleConverter.run()).toThrow()
  })

  describe('runs', () => {
    let stringResult: CheckRequest
    let functionResult: CheckRequest
    let stringResultSubjectSet: CheckRequest

    beforeAll(() => {
      stringResult = stringConverter.run()
      functionResult = functionConverter.run()
      stringResultSubjectSet = stringConverterSubjectSet.run()
    })

    it('gets namespace', () => {
      expect(stringResult.getNamespace()).toBe('testNamespace')

      expect(functionResult.getNamespace()).toBe('testNamespace')
    })

    it('gets object', () => {
      expect(stringResult.getObject()).toBe('testObject')

      expect(functionResult.getObject()).toBe('testObject')
    })

    it('gets relation', () => {
      expect(stringResult.getRelation()).toBe('testRelation')

      expect(functionResult.getRelation()).toBe('testRelation')
    })

    it('gets subjectId', () => {
      expect(stringResult.getSubject()?.getId()).toBe('testSubject')

      expect(functionResult.getSubject()?.getId()).toBe('testSubject')
    })

    describe('Subject set', () => {
      let stringSubjectSet: SubjectSet | undefined

      beforeAll(() => {
        stringSubjectSet = stringResultSubjectSet.getSubject()?.getSet()
      })

      it('gets namespace', () => {
        expect(stringSubjectSet?.getNamespace()).toBe('testSubjectNamespace')
      })

      it('gets object', () => {
        expect(stringSubjectSet?.getObject()).toBe('testSubjectObject')
      })

      it('gets relation', () => {
        expect(stringSubjectSet?.getRelation()).toBe('testSubjectRelation')
      })
    })
  })
})
