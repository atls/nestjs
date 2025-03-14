import type { AnyEntity }       from '@mikro-orm/core'
import type { EntityName }      from '@mikro-orm/core'
import type { MigrationObject } from '@mikro-orm/core'
import type { Options }         from '@mikro-orm/core'

export interface MikroORMConfigOptions {
  driver: Options['driver']

  port?: number
  host?: string
  database?: string
  username?: string
  password?: string

  entities?: Array<EntityName<AnyEntity>> | Record<string, EntityName<AnyEntity>>

  migrationsList?: Array<MigrationObject> | Record<string, MigrationObject['class']>

  migrationsTableName?: string

  debug?: boolean
}
