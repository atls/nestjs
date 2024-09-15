/* eslint-disable max-classes-per-file */

import { Module }                          from '@nestjs/common'
import { Test }                            from '@nestjs/testing'
import { TestingModule }             from '@nestjs/testing'
import { describe }                        from '@jest/globals'

import { afterEach }             from '@jest/globals'

import { it }         from '@jest/globals'

import { expect } from '@jest/globals'

import { HydraModuleOptions }              from './hydra-module-options.interface.js'
import { HYDRA_MODULE_OPTIONS }            from './hydra.constants.js'
import { HydraModule }                     from './hydra.module.js'

describe('hydra', () => {
  describe('module', () => {
    let module: TestingModule

    afterEach(async () => {
      await module.close()
    })

    it(`register`, async () => {
      module = await Test.createTestingModule({
        imports: [
          HydraModule.register({
            urls: {
              admin: 'http://localhost:3000',
            },
          }),
        ],
      }).compile()

      expect(module.get(HYDRA_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      module = await Test.createTestingModule({
        imports: [
          HydraModule.registerAsync({
            useFactory: () => ({
              urls: {
                admin: 'http://localhost:3000',
              },
            }),
          }),
        ],
      }).compile()

      expect(module.get(HYDRA_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use class`, async () => {
      class TestHydraModuleOptions {
        createHydraOptions(): HydraModuleOptions {
          return {
            urls: {
              admin: 'http://localhost:3000',
            },
          }
        }
      }

      module = await Test.createTestingModule({
        imports: [
          HydraModule.registerAsync({
            useClass: TestHydraModuleOptions,
          }),
        ],
      }).compile()

      expect(module.get(HYDRA_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use exists`, async () => {
      class TestHydraModuleOptions {
        createHydraOptions(): HydraModuleOptions {
          return {
            urls: {
              admin: 'http://localhost:3000',
            },
          }
        }
      }

      @Module({})
      class TestHydraModule {}

      module = await Test.createTestingModule({
        imports: [
          HydraModule.registerAsync({
            imports: [
              {
                module: TestHydraModule,
                providers: [TestHydraModuleOptions],
                exports: [TestHydraModuleOptions],
              },
            ],
            useExisting: TestHydraModuleOptions,
          }),
        ],
      }).compile()

      expect(module.get(HYDRA_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
