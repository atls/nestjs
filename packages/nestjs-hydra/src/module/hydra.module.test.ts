/* eslint-disable max-classes-per-file */

import type { TestingModule }      from '@nestjs/testing'

import type { HydraModuleOptions } from './hydra-module-options.interface.js'

import assert                      from 'node:assert/strict'
import { afterEach }               from 'node:test'
import { describe }                from 'node:test'
import { it }                      from 'node:test'

import { Module }                  from '@nestjs/common'
import { Test }                    from '@nestjs/testing'

import { HYDRA_MODULE_OPTIONS }    from './hydra.constants.js'
import { HydraModule }             from './hydra.module.js'

describe('hydra', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it(`register`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          HydraModule.register({
            urls: {
              admin: 'http://localhost:3000',
            },
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(HYDRA_MODULE_OPTIONS))
    })

    it(`register async use factory`, async () => {
      testingModule = await Test.createTestingModule({
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

      assert.ok(testingModule.get(HYDRA_MODULE_OPTIONS))
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

      testingModule = await Test.createTestingModule({
        imports: [
          HydraModule.registerAsync({
            useClass: TestHydraModuleOptions,
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(HYDRA_MODULE_OPTIONS))
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

      testingModule = await Test.createTestingModule({
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

      assert.ok(testingModule.get(HYDRA_MODULE_OPTIONS))
    })
  })
})
