import { Module }                 from '@nestjs/common'
import { TypeOrmModule }          from '@nestjs/typeorm'

import { TypesenseModule }        from '@atls/nestjs-typesense'

import { TypesenseTypeOrmModule } from '../../src/index.js'
import { TestEntity }             from './test.entity.js'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [TestEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([TestEntity]),
    TypesenseModule.register(),
    TypesenseTypeOrmModule.register(),
  ],
  providers: [TestEntity],
  exports: [TypeOrmModule],
})
export class TypesenseTypeOrmIntegrationModule {}
