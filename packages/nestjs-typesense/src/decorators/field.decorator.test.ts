/* eslint-disable max-classes-per-file */

import { Field }          from './field.decorator'
import { FIELD_METADATA } from './field.decorator'
import { Schema }         from './schema.decorator'

describe('typesense', () => {
  describe('decorators', () => {
    describe('field', () => {
      it('should enhance field with metadata', () => {
        @Schema()
        class Test {
          @Field('string')
          field!: string
        }

        expect(Reflect.getMetadata(FIELD_METADATA, Test)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'field',
              type: 'string',
            }),
          ])
        )
      })

      it('should enhance field with custom name metadata', () => {
        @Schema()
        class Test {
          @Field('string', { name: 'custom' })
          field!: string
        }

        expect(Reflect.getMetadata(FIELD_METADATA, Test)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'custom',
              type: 'string',
            }),
          ])
        )
      })
    })

    it('should enhance field with options metadata', () => {
      @Schema()
      class Test {
        @Field('string', { facet: true, index: true, optional: true })
        field!: string
      }

      expect(Reflect.getMetadata(FIELD_METADATA, Test)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'field',
            type: 'string',
            facet: true,
            index: true,
            optional: true,
          }),
        ])
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

      expect(Reflect.getMetadata(FIELD_METADATA, Test)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'field',
            type: 'string',
          }),
          expect.objectContaining({
            name: 'field2',
            type: 'string',
          }),
        ])
      )
    })
  })
})
