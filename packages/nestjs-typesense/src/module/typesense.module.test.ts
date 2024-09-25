/* eslint-disable max-classes-per-file */

import type { TestingModule }          from '@nestjs/testing'

import type { TypesenseModuleOptions } from './typesense-module.interface.js'

import { Module }                      from '@nestjs/common'
import { Test }                        from '@nestjs/testing'
import { describe }                    from '@jest/globals'
import { expect }                      from '@jest/globals'
import { it }                          from '@jest/globals'
import { afterEach }                   from '@jest/globals'

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

      expect(testingModule.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
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

      expect(testingModule.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
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

      expect(testingModule.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
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

      expect(testingModule.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
