import type { DynamicModule }                from '@nestjs/common'

import { MikroORM }                          from '@mikro-orm/core'
import { Module }                            from '@nestjs/common'
import { APP_INTERCEPTOR }                   from '@nestjs/core'

import { MikroORMRequestContextInterceptor } from '../interceptors/index.js'

@Module({})
export class MikroORMRequestContextModule {
  static forInterceptor(options = {}): DynamicModule {
    return {
      ...options,
      module: MikroORMRequestContextModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useFactory: (orm: MikroORM) => new MikroORMRequestContextInterceptor(orm),
          inject: [MikroORM],
        },
      ],
    }
  }
}
