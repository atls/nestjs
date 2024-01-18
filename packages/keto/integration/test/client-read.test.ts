/**
 * @jest-environment node
 */

import { INestApplication }          from '@nestjs/common'
import { TestingModule }             from '@nestjs/testing'
import { Test }                      from '@nestjs/testing'

import request                       from 'supertest'
import { Network }                   from 'testcontainers'
import { Wait }                      from 'testcontainers'
import { StartedTestContainer }      from 'testcontainers'
import { GenericContainer }          from 'testcontainers'

import { KETO_MODULE_CONFIGURATION } from '../../src'
import { KetoIntegrationModule }     from '../src'
import { KETO_WRITE_PORT }           from './test.constants'
import { KETO_READ_PORT }            from './test.constants'
import { APP_PORT }                  from './test.constants'
import { KETO_FILES }                from './test.constants'
import { KETO_ENVIRONMENT }          from './test.constants'
import { DB_PORT }                   from './test.constants'
import { DB_ENVIRONMENT }            from './test.constants'
import { KETO_START_COMMAND }        from './test.constants'
import { KETO_INIT_COMMAND }         from './test.constants'
import { KETO_MIGRATE_COMMAND }      from './test.constants'

jest.setTimeout(60000)

describe('Keto read client', () => {
  let app: INestApplication
  let url: string
  let module: TestingModule

  let dbContainer: StartedTestContainer
  let ketoContainer: StartedTestContainer

  beforeAll(async () => {
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
      .overrideProvider(KETO_MODULE_CONFIGURATION)
      .useValue({
        basePath: `http://${ketoContainer.getHost()}:${ketoContainer.getMappedPort(KETO_READ_PORT)}`,
      })
      .compile()

    app = module.createNestApplication()

    await app.init()
    await app.listen(APP_PORT)

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
