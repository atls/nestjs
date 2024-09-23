/* eslint-disable max-classes-per-file */

import 'reflect-metadata'

import type { TestingModule }        from '@nestjs/testing'

import { Module }                    from '@nestjs/common'
import { DiscoveryModule }           from '@nestjs/core'
import { Test }                      from '@nestjs/testing'
import { describe }                  from '@jest/globals'
import { it }                        from '@jest/globals'
import { expect }                    from '@jest/globals'
import { beforeEach }                from '@jest/globals'
import { afterEach }                 from '@jest/globals'

import { Schema }                    from '../decorators/index.js'
import { Field }                     from '../decorators/index.js'
import { TypesenseMetadataAccessor } from './typesense.metadata-accessor.js'
import { TypesenseMetadataExplorer } from './typesense.metadata-explorer.js'
import { TypesenseMetadataRegistry } from './typesense.metadata-registry.js'

describe('typesense', () => {
  describe('metadata', () => {
    describe('explorer', () => {
      let testingModule: TestingModule

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
        testingModule = await Test.createTestingModule({
          imports: [TestMetadataModule],
          providers: [TestSchema],
        }).compile()

        await testingModule.init()
      })

      afterEach(async () => {
        await testingModule.close()
      })

      it('should store schema metadata', () => {
        expect(
          testingModule.get(TypesenseMetadataRegistry).getSchemaByTarget(TestSchema)
        ).toBeDefined()
      })
    })
  })
})
