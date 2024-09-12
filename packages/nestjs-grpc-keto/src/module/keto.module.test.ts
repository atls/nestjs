/* eslint-disable max-classes-per-file */
import { Module }              from '@nestjs/common'
import { Test }                from '@nestjs/testing'
import { TestingModule }       from '@nestjs/testing'

import { KetoModuleOptions }   from './keto-module.interfaces.js'
import { KETO_WRITE_CLIENT }   from './keto.constants.js'
import { KETO_READ_CLIENT }    from './keto.constants.js'
import { KETO_MODULE_OPTIONS } from './keto.constants.js'
import { KetoModule }          from './keto.module.js'
import {describe, it, expect, afterEach} from '@jest/globals'

describe('Keto module', () => {
  let module: TestingModule
  const READ_URL = 'http://localhost:4466'
  const WRITE_URL = 'http://localhost:4467'

  afterEach(async () => {
    await module.close()
  })

  it('registers', async () => {
    module = await Test.createTestingModule({
      imports: [
        KetoModule.register({
          read: READ_URL,
          write: WRITE_URL,
        }),
      ],
    }).compile()

    expect(module.get(KETO_MODULE_OPTIONS)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
  })

  it(`registers async use exists`, async () => {
    class TestKetoModuleOptions {
      createKetoOptions(): KetoModuleOptions {
        return {
          read: READ_URL,
          write: WRITE_URL,
        }
      }
    }

    @Module({})
    class TestKetoModule {}

    module = await Test.createTestingModule({
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

    expect(module.get(KETO_MODULE_OPTIONS)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
  })

  it(`registers async use class`, async () => {
    class TestKetoModuleOptions {
      createKetoOptions(): KetoModuleOptions {
        return {
          read: READ_URL,
          write: WRITE_URL,
        }
      }
    }

    module = await Test.createTestingModule({
      imports: [
        KetoModule.registerAsync({
          useClass: TestKetoModuleOptions,
        }),
      ],
    }).compile()

    expect(module.get(KETO_MODULE_OPTIONS)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
  })
})
