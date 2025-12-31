import type { AnyEntity }                       from '@mikro-orm/core'
import type { EntityClass }                     from '@mikro-orm/core'
import type { EntityClassGroup }                from '@mikro-orm/core'
import type { EntitySchema }                    from '@mikro-orm/core'
import type { MigrationObject }                 from '@mikro-orm/core'
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
    const {
      driver,
      port,
      host,
      database,
      username,
      password,
      debug,
      entities,
      migrationsList,
      migrationsTableName,
    } = this.options

    let resolvedEntities: Array<
      EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema | string
    > = []
    if (Array.isArray(entities)) {
      resolvedEntities = entities as Array<
        EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema | string
      >
    } else if (entities) {
      resolvedEntities = Object.values(entities) as Array<
        EntityClass<AnyEntity> | EntityClassGroup<AnyEntity> | EntitySchema | string
      >
    }

    let resolvedMigrationsList: Array<MigrationObject> = []
    if (Array.isArray(migrationsList)) {
      resolvedMigrationsList = migrationsList
    } else if (migrationsList) {
      resolvedMigrationsList = Object.keys(migrationsList).map((name) => ({
        name,
        class: migrationsList[name],
      }))
    }

    return MikroORMConfigBuilder.build({
      driver,
      port: this.port || port,
      host: this.host || host,
      dbName: database,
      user: username,
      password,
      debug,
      entities: resolvedEntities,
      migrations: {
        disableForeignKeys: false,
        tableName: migrationsTableName,
        migrationsList: resolvedMigrationsList,
      },
    })
  }
}
