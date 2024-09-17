import type { RedisOptions }             from 'ioredis'

import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'

import { REDIS_MODULE_OPTIONS_PORT }     from './redis.module.constants.js'
import { REDIS_MODULE_OPTIONS_HOST }     from './redis.module.constants.js'
import { REDIS_MODULE_OPTIONS_PASSWORD } from './redis.module.constants.js'
import { REDIS_MODULE_OPTIONS_USERNAME } from './redis.module.constants.js'

@Injectable()
export class RedisConfigFactory {
  constructor(
    @Inject(REDIS_MODULE_OPTIONS_PORT)
    private readonly port: number,
    @Inject(REDIS_MODULE_OPTIONS_HOST)
    private readonly host: string,
    @Inject(REDIS_MODULE_OPTIONS_PASSWORD)
    private readonly password: string,
    @Inject(REDIS_MODULE_OPTIONS_USERNAME)
    private readonly username: string
  ) {}

  createRedisOptions(): RedisOptions {
    return {
      username: this.username || process.env.REDIS_USERNAME || 'default',
      password: this.password || process.env.REDIS_PASSWORD || 'password',
      host: this.host || process.env.REDIS_HOST || 'localhost',
      port: this.port || 6379,
    }
  }
}
