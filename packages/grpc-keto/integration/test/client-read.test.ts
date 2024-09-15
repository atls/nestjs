/**
 * @jest-environment node
 */

import { INestApplication }      from '@nestjs/common'
import { TestingModule }         from '@nestjs/testing'
import { Test }                  from '@nestjs/testing'
import { Network }               from 'testcontainers'
import { Wait }                  from 'testcontainers'
import { StartedTestContainer }  from 'testcontainers'
import { GenericContainer }      from 'testcontainers'
import getPort                   from 'get-port'
import request                   from 'supertest'

import { KETO_MODULE_OPTIONS }   from '../../src/index.js'
import { KetoIntegrationModule } from '../src/index.js'
import { KETO_WRITE_PORT }       from './test.constants.js'
import { KETO_READ_PORT }        from './test.constants.js'
import { KETO_FILES }            from './test.constants.js'
import { KETO_ENVIRONMENT }      from './test.constants.js'
import { DB_PORT }               from './test.constants.js'
import { DB_ENVIRONMENT }        from './test.constants.js'
import { KETO_START_COMMAND }    from './test.constants.js'
import { KETO_INIT_COMMAND }     from './test.constants.js'
import { KETO_MIGRATE_COMMAND }  from './test.constants.js'
import { jest, describe, beforeAll, afterAll, it } from '@jest/globals'

jest.setTimeout(25000)

describe('Keto read client', () => {
  let app: INestApplication
  let url: string
  let module: TestingModule

  let dbContainer: StartedTestContainer
  let ketoContainer: StartedTestContainer

  beforeAll(async () => {
    const port = await getPort()

    const network = await new Network().start()

    dbContainer = await new GenericContainer('bitnami/postgresql')
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .withEnvironment(DB_ENVIRONMENT)
      .withNetwork(network)
      .withNetworkAliases('db')
      .withExposedPorts(DB_PORT)
      .start()

    await new GenericContainer('oryd/keto')
      .withEnvironment(KETO_ENVIRONMENT)
      .withCopyFilesToContainer(KETO_FILES)
      .withNetwork(network)
      .withCommand(KETO_MIGRATE_COMMAND)
      .start()

    ketoContainer = await new GenericContainer('oryd/keto')
      .withEnvironment(KETO_ENVIRONMENT)
      .withCopyFilesToContainer(KETO_FILES)
      .withNetwork(network)
      .withExposedPorts(KETO_READ_PORT, KETO_WRITE_PORT)
      .withCommand(KETO_START_COMMAND)
      .start()

    await ketoContainer.exec(KETO_INIT_COMMAND)

    module = await Test.createTestingModule({
      imports: [KetoIntegrationModule],
    })
      .overrideProvider(KETO_MODULE_OPTIONS)
      .useValue({
        read: `${ketoContainer.getHost()}:${ketoContainer.getMappedPort(KETO_READ_PORT)}`,
        write: `${ketoContainer.getHost()}:${ketoContainer.getMappedPort(KETO_WRITE_PORT)}`,
      })
      .compile()

    app = module.createNestApplication()

    await app.init()
    await app.listen(port)

    url = await app.getHttpServer()
  })

  afterAll(async () => {
    await app.close()

    await dbContainer.stop()
    await ketoContainer.stop()
  })

  it('allowed', async () => request(url).get('/allowed').expect(200))

  it('allows if relation tuple is ok', async () =>
    request(url).get('/protected-by-keto').set('x-user', 'testUser').expect(200))
})
