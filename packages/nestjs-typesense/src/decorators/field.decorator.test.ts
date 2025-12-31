/* eslint-disable max-classes-per-file */

import assert             from 'node:assert/strict'
import { describe }       from 'node:test'
import { it }             from 'node:test'

import { Field }          from './field.decorator.js'
import { FIELD_METADATA } from './field.decorator.js'
import { Schema }         from './schema.decorator.js'

describe('typesense', () => {
  describe('decorators', () => {
    describe('field', () => {
      it('should enhance field with metadata', () => {
        @Schema()
        class Test {
          @Field('string')
          field!: string
        }

        const metadata = Reflect.getMetadata(FIELD_METADATA, Test) as Array<Record<string, unknown>>
        assert.ok(metadata.some((entry) => entry.name === 'field' && entry.type === 'string'))
      })

      it('should enhance field with custom name metadata', () => {
        @Schema()
        class Test {
          @Field('string', { name: 'custom' })
          field!: string
        }

        const metadata = Reflect.getMetadata(FIELD_METADATA, Test) as Array<Record<string, unknown>>
        assert.ok(metadata.some((entry) => entry.name === 'custom' && entry.type === 'string'))
      })
    })

    it('should enhance field with options metadata', () => {
      @Schema()
      class Test {
        @Field('string', { facet: true, index: true, optional: true })
        field!: string
      }

      const metadata = Reflect.getMetadata(FIELD_METADATA, Test) as Array<Record<string, unknown>>
      assert.ok(
        metadata.some(
          (entry) =>
            entry.name === 'field' &&
            entry.type === 'string' &&
            entry.facet === true &&
            entry.index === true &&
            entry.optional === true
        )
      )
    })

    it('should enhance field with multiple fields metadata', () => {
      @Schema()
      class Test {
        @Field('string')
        field!: string

        @Field('string')
        field2!: string
      }

      const metadata = Reflect.getMetadata(FIELD_METADATA, Test) as Array<Record<string, unknown>>
      assert.ok(metadata.some((entry) => entry.name === 'field' && entry.type === 'string'))
      assert.ok(metadata.some((entry) => entry.name === 'field2' && entry.type === 'string'))
    })
  })
})
