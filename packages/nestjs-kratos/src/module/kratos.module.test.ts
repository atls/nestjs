/* eslint-disable max-classes-per-file */

import type { TestingModule }       from '@nestjs/testing'

import type { KratosModuleOptions } from './kratos-module-options.interface.js'

import { Module }                   from '@nestjs/common'
import { Test }                     from '@nestjs/testing'
import { describe }                 from '@jest/globals'
import { it }                       from '@jest/globals'
import { expect }                   from '@jest/globals'
import { afterEach }                from '@jest/globals'

import { KRATOS_MODULE_OPTIONS }    from './kratos.constants.js'
import { KratosModule }             from './kratos.module.js'

describe('kratos', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it(`register`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          KratosModule.register({
            public: 'http://localhost:3000',
            browser: 'http://localhost:3000',
          }),
        ],
      }).compile()

      expect(testingModule.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          KratosModule.registerAsync({
            useFactory: () => ({
              public: 'http://localhost:3000',
              browser: 'http://localhost:3000',
            }),
          }),
        ],
      }).compile()

      expect(testingModule.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use class`, async () => {
      class TestKratosModuleOptions {
        createKratosOptions(): KratosModuleOptions {
          return {
            public: 'http://localhost:3000',
            browser: 'http://localhost:3000',
          }
        }
      }

      testingModule = await Test.createTestingModule({
        imports: [
          KratosModule.registerAsync({
            useClass: TestKratosModuleOptions,
          }),
        ],
      }).compile()

      expect(testingModule.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use exists`, async () => {
      class TestKratosModuleOptions {
        createKratosOptions(): KratosModuleOptions {
          return {
            public: 'http://localhost:3000',
            browser: 'http://localhost:3000',
          }
        }
      }

      @Module({})
      class TestKratosModule {}

      testingModule = await Test.createTestingModule({
        imports: [
          KratosModule.registerAsync({
            imports: [
              {
                module: TestKratosModule,
                providers: [TestKratosModuleOptions],
                exports: [TestKratosModuleOptions],
              },
            ],
            useExisting: TestKratosModuleOptions,
          }),
        ],
      }).compile()

      expect(testingModule.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
