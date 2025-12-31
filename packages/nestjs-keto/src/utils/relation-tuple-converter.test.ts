import type { SubjectSet }        from '@ory/keto-client'

import type { RelationShipTuple } from '../module/index.js'

import assert                     from 'node:assert/strict'
import { before }                 from 'node:test'
import { describe }               from 'node:test'
import { it }                     from 'node:test'

import { RelationTupleConverter } from './relation-tuple-converter.js'

describe('Keto relation tuple converter', () => {
  let stringConverter: RelationTupleConverter
  let functionConverter: RelationTupleConverter
  let stringConverterSubjectSet: RelationTupleConverter
  let invalidTupleConverter: RelationTupleConverter

  before(() => {
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
    assert.ok(stringConverter)
    assert.ok(functionConverter)
  })

  it('throws if tuple is invalid', () => {
    assert.throws(() => invalidTupleConverter.run())
  })

  describe('runs', () => {
    let stringResult: RelationShipTuple
    let functionResult: RelationShipTuple
    let stringResultSubjectSet: RelationShipTuple

    before(() => {
      stringResult = stringConverter.run()
      functionResult = functionConverter.run()
      stringResultSubjectSet = stringConverterSubjectSet.run()
    })

    it('gets namespace', () => {
      assert.strictEqual(stringResult.namespace, 'testNamespace')

      assert.strictEqual(functionResult.namespace, 'testNamespace')
    })

    it('gets object', () => {
      assert.strictEqual(stringResult.object, 'testObject')

      assert.strictEqual(functionResult.object, 'testObject')
    })

    it('gets relation', () => {
      assert.strictEqual(stringResult.relation, 'testRelation')

      assert.strictEqual(functionResult.relation, 'testRelation')
    })

    it('gets subjectId', () => {
      if ('subject_id' in stringResult) {
        assert.strictEqual(stringResult.subject_id, 'testSubject')
      }

      if ('subject_id' in functionResult) {
        assert.strictEqual(functionResult.subject_id, 'testSubject')
      }
    })

    describe('Subject set', () => {
      let stringSubjectSet: SubjectSet | undefined

      before(() => {
        if ('subject_set' in stringResultSubjectSet) {
          stringSubjectSet = stringResultSubjectSet.subject_set
        }
      })

      it('gets namespace', () => {
        assert.strictEqual(stringSubjectSet?.namespace, 'testSubjectNamespace')
      })

      it('gets object', () => {
        assert.strictEqual(stringSubjectSet?.object, 'testSubjectObject')
      })

      it('gets relation', () => {
        assert.strictEqual(stringSubjectSet?.relation, 'testSubjectRelation')
      })
    })
  })
})
