import { SeederFactory }        from '@atls/typeorm-seeding'
import { TestingModule }        from '@nestjs/testing'
import { Test }                 from '@nestjs/testing'
import { TypeOrmModule }        from '@nestjs/typeorm'
import { describe }             from '@jest/globals'
import { afterEach }            from '@jest/globals'
import { it }                   from '@jest/globals'
import { expect }               from '@jest/globals'

import { TypeOrmSeedingModule } from './typeorm-seeding.module.js'

describe('typeorm-seeding', () => {
  describe('module', () => {
    let module: TestingModule

    afterEach(async () => {
      await module.close()
    })

    it(`register`, async () => {
      module = await Test.createTestingModule({
        imports: [
          TypeOrmSeedingModule.register(),
          TypeOrmModule.forRoot({
            type: 'sqljs',
          }),
        ],
      }).compile()

      expect(module.get(SeederFactory)).toBeDefined()
    })
  })
})
