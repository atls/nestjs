import type { INestApplication }             from '@nestjs/common'
import type { StartedTestContainer }         from 'testcontainers'
import type { Repository }                   from 'typeorm'

import { Test }                              from '@nestjs/testing'
import { jest }                              from '@jest/globals'
import { describe }                          from '@jest/globals'
import { beforeAll }                         from '@jest/globals'
import { it }                                from '@jest/globals'
import { expect }                            from '@jest/globals'
import { afterAll }                          from '@jest/globals'
import { getRepositoryToken }                from '@nestjs/typeorm'
import { GenericContainer }                  from 'testcontainers'
import { Wait }                              from 'testcontainers'
import { Client }                            from 'typesense'

import { TYPESENSE_MODULE_OPTIONS }          from '@atls/nestjs-typesense'

import { TypesenseTypeOrmIntegrationModule } from './src/index.js'
import { TestEntity }                        from './src/test.entity.js'

jest.setTimeout(30000)

describe('typesense-typeorm', () => {
  let typesense: StartedTestContainer
  let repository: Repository<TestEntity>
  let client: Client
  let app: INestApplication

  beforeAll(async () => {
    typesense = await new GenericContainer('typesense/typesense:27.0')
      .withWaitStrategy(Wait.forLogMessage('Peer refresh succeeded!'))
      .withEnvironment({
        TYPESENSE_DATA_DIR: '/tmp',
        TYPESENSE_API_KEY: 'test',
      })
      .withExposedPorts(8108)
      .start()

    const testModule = await Test.createTestingModule({
      imports: [TypesenseTypeOrmIntegrationModule],
    })
      .overrideProvider(TYPESENSE_MODULE_OPTIONS)
      .useValue({
        apiKey: 'test',
        nodes: [
          {
            host: typesense.getHost(),
            protocol: 'http',
            port: typesense.getMappedPort(8108),
          },
        ],
      })
      .compile()

    app = testModule.createNestApplication() as INestApplication

    await app.init()

    repository = testModule.get(getRepositoryToken(TestEntity))
    client = testModule.get(Client)
  })

  afterAll(async () => {
    await app.close()
    await typesense.stop()
  })

  it(`find after create`, async () => {
    await repository.save(
      repository.create({
        company: 'Stark Corp',
        employees: 1031,
      })
    )

    await new Promise((r) => {
      setTimeout(r, 5)
    })

    const result = await client.collections('test').documents().search({
      q: 'Stark',
      query_by: 'company',
      filter_by: 'employees:>1000',
    })

    expect(result.found).toBe(1)
  })

  it(`find after update`, async () => {
    const entity = await repository.save(
      repository.create({
        company: 'Stark Corp',
        employees: 10,
      })
    )

    entity.employees = 1031

    await repository.save(entity)

    await new Promise((r) => {
      setTimeout(r, 5)
    })

    const result = await client.collections('test').documents().search({
      q: 'Stark',
      query_by: 'company',
      filter_by: 'employees:>1000',
    })

    expect(result.found).toBe(2)
  })
})
