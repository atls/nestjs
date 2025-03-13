import type { MikroOrmOptionsFactory }          from '@mikro-orm/nestjs'
import type { MikroOrmModuleOptions }           from '@mikro-orm/nestjs'

import { Inject }                               from '@nestjs/common'
import { Injectable }                           from '@nestjs/common'

import { MIKRO_ORM_CONFIG_MODULE_OPTIONS }      from './mikro-orm-config.module.constants.js'
import { MIKRO_ORM_CONFIG_MODULE_OPTIONS_HOST } from './mikro-orm-config.module.constants.js'
import { MIKRO_ORM_CONFIG_MODULE_OPTIONS_PORT } from './mikro-orm-config.module.constants.js'
import { MikroORMConfigOptions }                from './mikro-orm-config.module.interfaces.js'
import { MikroORMConfigBuilder }                from './mikro-orm.config-builder.js'

@Injectable()
export class MikroORMConfig implements MikroOrmOptionsFactory {
  constructor(
    @Inject(MIKRO_ORM_CONFIG_MODULE_OPTIONS)
    private readonly options: MikroORMConfigOptions,
    @Inject(MIKRO_ORM_CONFIG_MODULE_OPTIONS_PORT)
    private readonly port: number,
    @Inject(MIKRO_ORM_CONFIG_MODULE_OPTIONS_HOST)
    private readonly host: string
  ) {}

  createMikroOrmOptions(): MikroOrmModuleOptions {
    return MikroORMConfigBuilder.build({
      driver: this.options.driver,
      port: this.port || this.options?.port,
      host: this.host || this.options?.host,
      dbName: this.options?.database,
      user: this.options?.username,
      password: this.options?.password,
      debug: this.options?.debug,
      entities: Array.isArray(this.options.entities)
        ? this.options.entities
        : Object.values(this.options.entities!),
      migrations: {
        disableForeignKeys: false,
        tableName: this.options.migrationsTableName,
        migrationsList: Array.isArray(this.options.migrationsList)
          ? this.options.migrationsList
          : Object.keys(this.options.migrationsList!).map((name) => ({
              name,
              class: (this.options.migrationsList! as any)[name],
            })),
      },
    })
  }
}
