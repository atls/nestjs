import type { TestingModule }     from '@nestjs/testing'

import assert                     from 'node:assert/strict'
import { afterEach }              from 'node:test'
import { describe }               from 'node:test'
import { it }                     from 'node:test'

import { Test }                   from '@nestjs/testing'
import { TypeOrmModule }          from '@nestjs/typeorm'
import { Column }                 from 'typeorm'
import { DataSource }             from 'typeorm'
import { Entity }                 from 'typeorm'
import { PrimaryGeneratedColumn } from 'typeorm'

import { SeederFactory }          from '../index.js'
import { TypeOrmSeedingModule }   from './typeorm-seeding.module.js'

@Entity()
class SeededEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: 'varchar' })
  name!: string
}

describe('typeorm-seeding', () => {
  describe('module', () => {
    let testingModule: TestingModule

    afterEach(async () => {
      await testingModule.close()
    })

    it('registers a factory that persists entities', async () => {
      testingModule = await Test.createTestingModule({
        imports: [
          TypeOrmSeedingModule.register(),
          TypeOrmModule.forRoot({
            type: 'sqljs',
            entities: [SeededEntity],
            synchronize: true,
          }),
        ],
      }).compile()

      const factory = testingModule.get(SeederFactory)
      const connection = testingModule.get(DataSource)

      assert.ok(factory)

      const created = await factory.for(SeededEntity).with({ name: 'Ada' }).create()

      assert.ok(!Array.isArray(created))

      const stored = await connection
        .getRepository(SeededEntity)
        .findOneByOrFail({ id: created.id })

      assert.equal(stored.name, 'Ada')
    })
  })
})
