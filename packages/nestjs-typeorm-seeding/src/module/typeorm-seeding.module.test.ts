import type { TestingModule }   from '@nestjs/testing'

import assert                   from 'node:assert/strict'
import { afterEach }            from 'node:test'
import { describe }             from 'node:test'
import { it }                   from 'node:test'

import { SeederFactory }        from '@atls/typeorm-seeding'
import { Test }                 from '@nestjs/testing'
import { TypeOrmModule }        from '@nestjs/typeorm'

import { TypeOrmSeedingModule } from './typeorm-seeding.module.js'

describe('typeorm-seeding', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it(`register`, async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          TypeOrmSeedingModule.register(),
          TypeOrmModule.forRoot({
            type: 'sqljs',
          }),
        ],
      }).compile()

      assert.ok(testingModule.get(SeederFactory))
    })
  })
})
