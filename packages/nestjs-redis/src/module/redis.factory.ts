import type { RedisOptions }  from 'ioredis'

import { Injectable }         from '@nestjs/common'
import { Redis }              from 'ioredis'

import { RedisConfigFactory } from './redis.config-factory.js'

@Injectable()
export class RedisFactory {
  constructor(private readonly configFactory: RedisConfigFactory) {}

  create(options: RedisOptions = {}): Redis {
    return new Redis({
      ...this.configFactory.createRedisOptions(),
      ...options,
    })
  }
}
