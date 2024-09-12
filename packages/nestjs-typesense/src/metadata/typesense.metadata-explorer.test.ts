/* eslint-disable max-classes-per-file */

import 'reflect-metadata'

import { Module }                    from '@nestjs/common'
import { DiscoveryModule }           from '@nestjs/core'
import { Test }                      from '@nestjs/testing'

import { Schema }                    from '../decorators'
import { Field }                     from '../decorators'
import { TypesenseMetadataAccessor } from './typesense.metadata-accessor'
import { TypesenseMetadataExplorer } from './typesense.metadata-explorer'
import { TypesenseMetadataRegistry } from './typesense.metadata-registry'

describe('typesense', () => {
  describe('metadata', () => {
    describe('explorer', () => {
      let module

      @Module({
        imports: [DiscoveryModule],
        providers: [
          TypesenseMetadataAccessor,
          TypesenseMetadataExplorer,
          TypesenseMetadataRegistry,
        ],
      })
      class TestMetadataModule {}

      @Schema()
      class TestSchema {
        @Field('string')
        field!: string
      }

      beforeEach(async () => {
        module = await Test.createTestingModule({
          imports: [TestMetadataModule],
          providers: [TestSchema],
        }).compile()

        await module.init()
      })

      afterEach(async () => {
        await module.close()
      })

      it('should store schema metadata', () => {
        expect(module.get(TypesenseMetadataRegistry).getSchemaByTarget(TestSchema)).toBeDefined()
      })
    })
  })
})
