/* eslint-disable max-classes-per-file */
import { Module }                    from '@nestjs/common'
import { Test }                      from '@nestjs/testing'
import { TestingModule }             from '@nestjs/testing'

import { KetoModuleOptions }         from './keto-module.interfaces'
import { KETO_WRITE_CLIENT }         from './keto.constants'
import { KETO_READ_CLIENT }          from './keto.constants'
import { KETO_MODULE_CONFIGURATION } from './keto.constants'
import { KetoModule }                from './keto.module'

describe('Keto module', () => {
  let module: TestingModule
  const BASE_PATH = 'http://localhost:4466'

  afterEach(async () => {
    await module.close()
  })

  it('registers', async () => {
    module = await Test.createTestingModule({
      imports: [
        KetoModule.register({
          basePath: BASE_PATH,
        }),
      ],
    }).compile()

    expect(module.get(KETO_MODULE_CONFIGURATION)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
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

    expect(module.get(KETO_MODULE_CONFIGURATION)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
  })

  it(`registers async use class`, async () => {
    class TestKetoModuleOptions {
      createKetoOptions(): KetoModuleOptions {
        return {
          basePath: BASE_PATH,
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

    expect(module.get(KETO_MODULE_CONFIGURATION)).toBeDefined()
    expect(module.get(KETO_READ_CLIENT)).toBeDefined()
    expect(module.get(KETO_WRITE_CLIENT)).toBeDefined()
  })
})
