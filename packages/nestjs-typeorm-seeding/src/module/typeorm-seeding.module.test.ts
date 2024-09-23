import type { TestingModule }   from '@nestjs/testing'

import { SeederFactory }        from '@atls/typeorm-seeding'
import { Test }                 from '@nestjs/testing'
import { TypeOrmModule }        from '@nestjs/typeorm'
import { describe }             from '@jest/globals'
import { afterEach }            from '@jest/globals'
import { it }                   from '@jest/globals'
import { expect }               from '@jest/globals'

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

      expect(testingModule.get(SeederFactory)).toBeDefined()
    })
  })
})
