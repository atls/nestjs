/* eslint-disable max-classes-per-file */

import { Module }                           from '@nestjs/common'
import { TestingModule }                    from '@nestjs/testing'
import { Test }                             from '@nestjs/testing'
import { describe }                         from '@jest/globals'
import { expect }                           from '@jest/globals'
import { it }                               from '@jest/globals'
import { afterEach }                        from '@jest/globals'

import { ExternalRendererModuleOptions }    from './external-renderer-module-options.interface.js'
import { EXTERNAL_RENDERER_MODULE_OPTIONS } from './external-renderer.constants.js'
import { ExternalRendererModule }           from './external-renderer.module.js'

describe('external-renderer', () => {
  describe('module', () => {
    let module: TestingModule

    afterEach(async () => {
      await module.close()
    })

    it(`register`, async () => {
      module = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.register({
            url: 'http://localhost:3000',
          }),
        ],
      }).compile()

      expect(module.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use factory`, async () => {
      module = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.registerAsync({
            useFactory: () => ({
              url: 'http://localhost:3000',
            }),
          }),
        ],
      }).compile()

      expect(module.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })

    it(`register async use class`, async () => {
      class TestExternalRendererModuleOptions {
        createExternalRendererOptions(): ExternalRendererModuleOptions {
          return {
            url: 'http://localhost:3000',
          }
        }
      }

      module = await Test.createTestingModule({
        imports: [
          ExternalRendererModule.registerAsync({
            useClass: TestExternalRendererModuleOptions,
          }),
        ],
      }).compile()

      expect(module.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
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

      module = await Test.createTestingModule({
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

      expect(module.get(EXTERNAL_RENDERER_MODULE_OPTIONS)).toBeDefined()
    })
  })
})
