/* eslint-disable max-classes-per-file */
import type { TestingModule }        from '@nestjs/testing'

import type { KetoModuleOptions }    from './keto-module.interfaces.js'

import assert                        from 'node:assert/strict'
import { afterEach }                 from 'node:test'
import { describe }                  from 'node:test'
import { it }                        from 'node:test'

import { Module }                    from '@nestjs/common'
import { Test }                      from '@nestjs/testing'

import { KETO_WRITE_CLIENT }         from './keto.constants.js'
import { KETO_READ_CLIENT }          from './keto.constants.js'
import { KETO_MODULE_CONFIGURATION } from './keto.constants.js'
import { KetoModule }                from './keto.module.js'

describe('Keto module', () => {
  let testingModule: TestingModule
  const BASE_PATH = 'http://localhost:4466'

  afterEach(async () => {
    await testingModule.close()
  })

  it('registers', async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        KetoModule.register({
          basePath: BASE_PATH,
        }),
      ],
    }).compile()

    assert.ok(testingModule.get(KETO_MODULE_CONFIGURATION))
    assert.ok(testingModule.get(KETO_READ_CLIENT))
    assert.ok(testingModule.get(KETO_WRITE_CLIENT))
  })

  it(`registers async use exists`, async () => {
    class TestKetoModuleOptions {
      createKetoOptions(): KetoModuleOptions {
        return {
          basePath: BASE_PATH,
        }
      }
    }

    @Module({})
    class TestKetoModule {}

    testingModule = await Test.createTestingModule({
      imports: [
        KetoModule.registerAsync({
          imports: [
            {
              module: TestKetoModule,
              providers: [TestKetoModuleOptions],
              exports: [TestKetoModuleOptions],
            },
          ],
          useExisting: TestKetoModuleOptions,
        }),
      ],
    }).compile()

    assert.ok(testingModule.get(KETO_MODULE_CONFIGURATION))
    assert.ok(testingModule.get(KETO_READ_CLIENT))
    assert.ok(testingModule.get(KETO_WRITE_CLIENT))
  })

  it(`registers async use class`, async () => {
    class TestKetoModuleOptions {
      createKetoOptions(): KetoModuleOptions {
        return {
          basePath: BASE_PATH,
        }
      }
    }

    testingModule = await Test.createTestingModule({
      imports: [
        KetoModule.registerAsync({
          useClass: TestKetoModuleOptions,
        }),
      ],
    }).compile()

    assert.ok(testingModule.get(KETO_MODULE_CONFIGURATION))
    assert.ok(testingModule.get(KETO_READ_CLIENT))
    assert.ok(testingModule.get(KETO_WRITE_CLIENT))
  })
})
