/* eslint-disable max-classes-per-file */

import 'reflect-metadata'

import type { TestingModule }        from '@nestjs/testing'

import assert                        from 'node:assert/strict'
import { afterEach }                 from 'node:test'
import { beforeEach }                from 'node:test'
import { describe }                  from 'node:test'
import { it }                        from 'node:test'

import { Module }                    from '@nestjs/common'
import { DiscoveryModule }           from '@nestjs/core'
import { Test }                      from '@nestjs/testing'

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
        assert.ok(testingModule.get(TypesenseMetadataRegistry).getSchemaByTarget(TestSchema))
      })
    })
  })
})
