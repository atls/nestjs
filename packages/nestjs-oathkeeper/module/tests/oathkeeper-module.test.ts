/* eslint-disable max-classes-per-file */

import type { TestingModule }           from '@nestjs/testing'

import type { OathkeeperModuleOptions } from '../../src/module/interfaces.js'

import assert                           from 'node:assert/strict'
import { afterEach }                    from 'node:test'
import { describe }                     from 'node:test'
import { it }                           from 'node:test'

import { Module }                       from '@nestjs/common'
import { Test }                         from '@nestjs/testing'

import { OATHKEEPER_API }               from '../../src/constants.js'
import { OATHKEEPER_MODULE_OPTIONS }    from '../../src/constants.js'
import { OathkeeperDecisionService }    from '../../src/decision.js'
import { OathkeeperIdentityMiddleware } from '../../src/middleware.js'
import { OathkeeperModule }             from '../../src/module/index.js'

describe('OathkeeperModule', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('wires providers through register', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        OathkeeperModule.register({
          urls: {
            api: 'http://oathkeeper-api:4456',
          },
        }),
      ],
    }).compile()

    assert.ok(moduleRef.get(OATHKEEPER_MODULE_OPTIONS))
    assert.ok(moduleRef.get(OATHKEEPER_API))
    assert.ok(moduleRef.get(OathkeeperDecisionService))
    assert.ok(moduleRef.get(OathkeeperIdentityMiddleware))
  })

  it('wires providers through registerAsync useFactory', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        OathkeeperModule.registerAsync({
          useFactory: () => ({
            urls: {
              api: 'http://oathkeeper-api:4456',
            },
          }),
        }),
      ],
    }).compile()

    assert.ok(moduleRef.get(OathkeeperDecisionService))
  })

  it('wires providers through registerAsync useClass', async () => {
    class TestOathkeeperOptions {
      createOathkeeperOptions(): OathkeeperModuleOptions {
        return {
          urls: {
            api: 'http://oathkeeper-api:4456',
          },
        }
      }
    }

    moduleRef = await Test.createTestingModule({
      imports: [
        OathkeeperModule.registerAsync({
          useClass: TestOathkeeperOptions,
        }),
      ],
    }).compile()

    assert.ok(moduleRef.get(OathkeeperDecisionService))
  })

  it('wires providers through registerAsync useExisting', async () => {
    class TestOathkeeperOptions {
      createOathkeeperOptions(): OathkeeperModuleOptions {
        return {
          urls: {
            api: 'http://oathkeeper-api:4456',
          },
        }
      }
    }

    @Module({})
    class TestOathkeeperModule {}

    moduleRef = await Test.createTestingModule({
      imports: [
        OathkeeperModule.registerAsync({
          imports: [
            {
              module: TestOathkeeperModule,
              providers: [TestOathkeeperOptions],
              exports: [TestOathkeeperOptions],
            },
          ],
          useExisting: TestOathkeeperOptions,
        }),
      ],
    }).compile()

    assert.ok(moduleRef.get(OathkeeperDecisionService))
  })
})
