import type { DynamicModule } from '@nestjs/common'

import { SeederFactory }      from '@atls/typeorm-seeding'
import { Module }             from '@nestjs/common'
import { DataSource }         from 'typeorm'

@Module({})
export class TypeOrmSeedingModule {
  static register(): DynamicModule {
    const seederFactoryProvider = {
      provide: SeederFactory,
      useFactory: (connection: DataSource) => new SeederFactory({ connection }),
      inject: [DataSource],
    }

    return {
      global: true,
      module: TypeOrmSeedingModule,
      providers: [seederFactoryProvider],
      exports: [seederFactoryProvider],
    }
  }
}
