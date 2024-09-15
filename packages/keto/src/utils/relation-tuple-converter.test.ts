import { SubjectSet }                      from '@ory/keto-client'
import { describe }                        from '@jest/globals'

import { beforeAll }             from '@jest/globals'

import { it }         from '@jest/globals'

import { expect } from '@jest/globals'

import { RelationShipTuple }               from '../module/index.js'
import { RelationTupleConverter }          from './relation-tuple-converter.js'

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
    let stringResult: RelationShipTuple
    let functionResult: RelationShipTuple
    let stringResultSubjectSet: RelationShipTuple

    beforeAll(() => {
      stringResult = stringConverter.run()
      functionResult = functionConverter.run()
      stringResultSubjectSet = stringConverterSubjectSet.run()
    })

    it('gets namespace', () => {
      expect(stringResult.namespace).toBe('testNamespace')

      expect(functionResult.namespace).toBe('testNamespace')
    })

    it('gets object', () => {
      expect(stringResult.object).toBe('testObject')

      expect(functionResult.object).toBe('testObject')
    })

    it('gets relation', () => {
      expect(stringResult.relation).toBe('testRelation')

      expect(functionResult.relation).toBe('testRelation')
    })

    it('gets subjectId', () => {
      // @ts-ignore
      expect(stringResult.subject_id).toBe('testSubject')

      // @ts-ignore
      expect(functionResult.subject_id).toBe('testSubject')
    })

    describe('Subject set', () => {
      let stringSubjectSet: SubjectSet | undefined

      beforeAll(() => {
        // @ts-ignore
        stringSubjectSet = stringResultSubjectSet.subject_set
      })

      it('gets namespace', () => {
        expect(stringSubjectSet?.namespace).toBe('testSubjectNamespace')
      })

      it('gets object', () => {
        expect(stringSubjectSet?.object).toBe('testSubjectObject')
      })

      it('gets relation', () => {
        expect(stringSubjectSet?.relation).toBe('testSubjectRelation')
      })
    })
  })
})
