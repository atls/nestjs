import assert                      from 'node:assert/strict'
import { it }                      from 'node:test'

import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy'
import { Migrator }                from '@mikro-orm/migrations'
import { PostgreSqlDriver }        from '@mikro-orm/postgresql'
import { Test }                    from '@nestjs/testing'

import { MikroORMConfigModule }    from './mikro-orm-config.module.js'
import { MikroORMConfig }          from './mikro-orm.config.js'

class ExampleEntity {}

it('resolves MikroORM 7 configuration from the Nest module', async () => {
  const testingModule = await Test.createTestingModule({
    imports: [
      MikroORMConfigModule.register({
        driver: PostgreSqlDriver,
        entities: [ExampleEntity],
        host: 'database',
        port: 5432,
        migrationsTableName: 'service_migrations',
      }),
    ],
  }).compile()

  try {
    const options = testingModule.get(MikroORMConfig).createMikroOrmOptions()

    assert.equal(options.driver, PostgreSqlDriver)
    assert.deepEqual(options.entities, [ExampleEntity])
    assert.equal(options.host, 'database')
    assert.equal(options.port, 5432)
    assert.equal(options.migrations?.tableName, 'service_migrations')
    assert.equal(options.metadataProvider, ReflectMetadataProvider)
    assert.deepEqual(options.extensions, [Migrator])
  } finally {
    await testingModule.close()
  }
})
