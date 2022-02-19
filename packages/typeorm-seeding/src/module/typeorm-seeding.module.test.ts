import { SeederFactory }        from '@atls/typeorm-seeding'
import { Test }                 from '@nestjs/testing'
import { TypeOrmModule }        from '@nestjs/typeorm'

import { TypeOrmSeedingModule } from './typeorm-seeding.module'

describe('typeorm-seeding', () => {
  describe('module', () => {
    let module

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
