/* eslint-disable max-classes-per-file */

import type { TestingModule }          from '@nestjs/testing'

import type { TypesenseModuleOptions } from './typesense-module.interface.js'

import assert                          from 'node:assert/strict'
import { afterEach }                   from 'node:test'
import { describe }                    from 'node:test'
import { it }                          from 'node:test'

import { Module }                      from '@nestjs/common'
import { Test }                        from '@nestjs/testing'

import { TYPESENSE_MODULE_OPTIONS }    from './typesense.constants.js'
import { TypesenseModule }             from './typesense.module.js'

describe('typesense', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it(`register`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          TypesenseModule.register({
            apiKey: 'test',
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(TYPESENSE_MODULE_OPTIONS))
    })

    it(`register async use factory`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          TypesenseModule.registerAsync({
            useFactory: () => ({
              apiKey: 'test',
            }),
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(TYPESENSE_MODULE_OPTIONS))
    })

    it(`register async use class`, async () => {
      class TestTypesenseModuleOptions {
        createTypesenseOptions(): TypesenseModuleOptions {
          return {
            apiKey: 'test',
          }
        }
      }

      testingModule = await Test.createTestingModule({
        imports: [
          TypesenseModule.registerAsync({
            useClass: TestTypesenseModuleOptions,
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(TYPESENSE_MODULE_OPTIONS))
    })

    it(`register async use exists`, async () => {
      class TestTypesenseModuleOptions {
        createTypesenseOptions(): TypesenseModuleOptions {
          return {
            apiKey: 'test',
          }
        }
      }

      @Module({})
      class TestTypesenseModule {}

      testingModule = await Test.createTestingModule({
        imports: [
          TypesenseModule.registerAsync({
            imports: [
              {
                module: TestTypesenseModule,
                providers: [TestTypesenseModuleOptions],
                exports: [TestTypesenseModuleOptions],
              },
            ],
            useExisting: TestTypesenseModuleOptions,
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(TYPESENSE_MODULE_OPTIONS))
    })
  })
})
