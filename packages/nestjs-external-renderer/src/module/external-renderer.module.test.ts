/* eslint-disable max-classes-per-file */

import type { TestingModule }                 from '@nestjs/testing'

import type { ExternalRendererModuleOptions } from './external-renderer-module-options.interface.js'

import { Module }                             from '@nestjs/common'
import { Test }                               from '@nestjs/testing'
import { describe }                           from '@jest/globals'
import { expect }                             from '@jest/globals'
import { it }                                 from '@jest/globals'
import { afterEach }                          from '@jest/globals'

import { EXTERNAL_RENDERER_MODULE_OPTIONS }   from './external-renderer.constants.js'
import { ExternalRendererModule }             from './external-renderer.module.js'

describe('external-renderer', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it(`register`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.register({
            url: 'http://localhost:3000',
          }),
        ],
      }).compile()

      expect(testingModule.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.registerAsync({
            useFactory: () => ({
              url: 'http://localhost:3000',
            }),
          }),
        ],
      }).compile()

      expect(testingModule.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use class`, async () => {
      class TestExternalRendererModuleOptions {
        createExternalRendererOptions(): ExternalRendererModuleOptions {
          return {
            url: 'http://localhost:3000',
          }
        }
      }

      testingModule = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.registerAsync({
            useClass: TestExternalRendererModuleOptions,
          }),
        ],
      }).compile()

      expect(testingModule.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use exists`, async () => {
      class TestExternalRendererModuleOptions {
        createExternalRendererOptions(): ExternalRendererModuleOptions {
          return {
            url: 'http://localhost:3000',
          }
        }
      }

      @Module({})
      class TestExternalRendererModule {}

      testingModule = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.registerAsync({
            imports: [
              {
                module: TestExternalRendererModule,
                providers: [TestExternalRendererModuleOptions],
                exports: [TestExternalRendererModuleOptions],
              },
            ],
            useExisting: TestExternalRendererModuleOptions,
          }),
        ],
      }).compile()

      expect(testingModule.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
