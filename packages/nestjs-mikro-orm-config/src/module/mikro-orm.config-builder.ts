import type { LoggerOptions }         from '@mikro-orm/core'
import type { MikroOrmModuleOptions } from '@mikro-orm/nestjs'

import { Logger }                     from '@atls/logger'
import { MikroORMLogger }             from '@atls/mikro-orm-logger'

export class MikroORMConfigBuilder {
  static build(options: Partial<MikroOrmModuleOptions>): MikroOrmModuleOptions {
    return {
      driver: options.driver,
      port: options.port || 5432,
      host: options.host || process.env.DB_HOST || 'localhost',
      dbName: options.dbName || process.env.DB_DATABASE || 'db',
      user: options.user || process.env.DB_USERNAME || 'postgres',
      password: options.password || process.env.DB_PASSWORD || 'password',
      debug: options.debug || Boolean(process.env.DB_DEBUG) || false,
      migrations: options.migrations,
      entities: options.entities,
      forceUndefined: true,

      loggerFactory: (opts: LoggerOptions): MikroORMLogger => new MikroORMLogger(opts),
      logger: (message: string): void => {
        new Logger('mikro-orm:migrations').info(message)
      },
    }
  }
}
