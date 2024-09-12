/* eslint-disable max-classes-per-file */

import { Module }                from '@nestjs/common'
import { Test }                  from '@nestjs/testing'

import { KratosModuleOptions }   from './kratos-module-options.interface'
import { KRATOS_MODULE_OPTIONS } from './kratos.constants'
import { KratosModule }          from './kratos.module'

describe('kratos', () => {
  describe('module', () => {
    let module

    afterEach(async () => {
      await module.close()
    })

    it(`register`, async () => {
      module = await Test.createTestingModule({
        imports: [
          KratosModule.register({
            public: 'http://localhost:3000',
            browser: 'http://localhost:3000',
          }),
        ],
      }).compile()

      expect(module.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      module = await Test.createTestingModule({
        imports: [
          KratosModule.registerAsync({
            useFactory: () => ({
              public: 'http://localhost:3000',
              browser: 'http://localhost:3000',
            }),
          }),
        ],
      }).compile()

      expect(module.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
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

      module = await Test.createTestingModule({
        imports: [
          KratosModule.registerAsync({
            useClass: TestKratosModuleOptions,
          }),
        ],
      }).compile()

      expect(module.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
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

      module = await Test.createTestingModule({
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

      expect(module.get(KRATOS_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
