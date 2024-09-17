import type { DynamicModule }                          from '@nestjs/common'

import type { GraphQLRedisSubscriptionsModuleOptions } from './graphql-redis-subscriptions.module.interfaces.js'

import { Module }                                      from '@nestjs/common'
import { RedisPubSub }                                 from 'graphql-redis-subscriptions'
import { PubSub }                                      from 'graphql-subscriptions'
import { stringify }                                   from 'telejson'
import { parse }                                       from 'telejson'

import { RedisModule }                                 from '@atls/nestjs-redis'
import { RedisFactory }                                from '@atls/nestjs-redis'

@Module({})
export class GraphQLRedisSubscriptionsModule {
  static register(options: GraphQLRedisSubscriptionsModuleOptions = {}): DynamicModule {
    const provider = {
      provide: PubSub,
      useFactory: (redisFactory: RedisFactory) =>
        new RedisPubSub({
          serializer: (data) => stringify(data),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          deserializer: (data) => parse(data instanceof Buffer ? data.toString() : data),
          publisher: redisFactory.create(),
          subscriber: redisFactory.create(),
          ...options,
        }),
      inject: [RedisFactory],
    }

    return {
      global: true,
      module: GraphQLRedisSubscriptionsModule,
      imports: [RedisModule.register()],
      providers: [provider],
      exports: [provider],
    }
  }
}
