/* eslint-disable max-classes-per-file */

import { Module }                   from '@nestjs/common'
import { Test }                     from '@nestjs/testing'

import { TypesenseModuleOptions }   from './typesense-module.interface'
import { TYPESENSE_MODULE_OPTIONS } from './typesense.constants'
import { TypesenseModule }          from './typesense.module'

describe('typesense', () => {
  describe('module', () => {
    let module

    afterEach(async () => {
      await module.close()
    })

    it(`register`, async () => {
      module = await Test.createTestingModule({
        imports: [
          TypesenseModule.register({
            apiKey: 'test',
          }),
        ],
      }).compile()

      expect(module.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      module = await Test.createTestingModule({
        imports: [
          TypesenseModule.registerAsync({
            useFactory: () => ({
              apiKey: 'test',
            }),
          }),
        ],
      }).compile()

      expect(module.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use class`, async () => {
      class TestTypesenseModuleOptions {
        createTypesenseOptions(): TypesenseModuleOptions {
          return {
            apiKey: 'test',
          }
        }
      }

      module = await Test.createTestingModule({
        imports: [
          TypesenseModule.registerAsync({
            useClass: TestTypesenseModuleOptions,
          }),
        ],
      }).compile()

      expect(module.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
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

      module = await Test.createTestingModule({
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

      expect(module.get(TYPESENSE_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
