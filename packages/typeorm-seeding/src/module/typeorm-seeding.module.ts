import { SeederFactory } from '@atls/typeorm-seeding'
import { DynamicModule } from '@nestjs/common'
import { Module }        from '@nestjs/common'

import { Connection }    from 'typeorm'

@Module({})
export class TypeOrmSeedingModule {
  static register(): DynamicModule {
    const seederFactoryProvider = {
      provide: SeederFactory,
      useFactory: (connection: Connection) => new SeederFactory({ connection }),
      inject: [Connection],
    }

    return {
      global: true,
      module: TypeOrmSeedingModule,
      providers: [seederFactoryProvider],
      exports: [seederFactoryProvider],
    }
  }
}
