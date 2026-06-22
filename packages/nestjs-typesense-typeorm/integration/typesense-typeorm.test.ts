import type { INestApplication }             from '@nestjs/common'
import type { StartedTestContainer }         from 'testcontainers'
import type { Repository }                   from 'typeorm'

import { after }                             from 'node:test'
import { before }                            from 'node:test'
import { describe }                          from 'node:test'
import { it }                                from 'node:test'

import { Test }                              from '@nestjs/testing'
import { getRepositoryToken }                from '@nestjs/typeorm'
import { GenericContainer }                  from 'testcontainers'
import { Wait }                              from 'testcontainers'
import { Client }                            from 'typesense'

import { TYPESENSE_MODULE_OPTIONS }          from '@atls/nestjs-typesense'

import { TypesenseTypeOrmIntegrationModule } from './src/index.js'
import { TestEntity }                        from './src/test.entity.js'

const TYPESENSE_WAIT_TIMEOUT = 5000
const TYPESENSE_WAIT_INTERVAL = 100

const waitForTypesenseFound = async (
  search: () => Promise<{ found?: number }>,
  expectedFound: number
): Promise<void> => {
  const endTime = Date.now() + TYPESENSE_WAIT_TIMEOUT
  let lastFound: number | undefined
  let lastError: unknown

  return new Promise((resolve, reject) => {
    const poll = async (): Promise<void> => {
      if (Date.now() > endTime) {
        if (lastError instanceof Error) {
          reject(new Error(`Timeout waiting for Typesense search result: ${lastError.message}`))
          return
        }

        reject(
          new Error(
            `Timeout waiting for Typesense search result: expected ${expectedFound}, received ${lastFound ?? 0}`
          )
        )
        return
      }

      try {
        const result = await search()
        lastFound = result.found
        lastError = undefined

        if (lastFound === expectedFound) {
          resolve()
          return
        }
      } catch (error) {
        lastError = error
      }

      setTimeout(() => {
        poll().catch(reject)
      }, TYPESENSE_WAIT_INTERVAL)
    }

    poll().catch(reject)
  })
}

const searchCompanyByEmployees = async (
  client: Client,
  filter: string
): Promise<{ found?: number }> =>
  client.collections('test').documents().search({
    q: 'Stark',
    query_by: 'company',
    filter_by: filter,
  })

describe('typesense-typeorm', { timeout: 30000 }, () => {
  let typesense: StartedTestContainer
  let repository: Repository<TestEntity>
  let client: Client
  let app: INestApplication

  before(async () => {
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

    app = testModule.createNestApplication()

    await app.init()

    repository = testModule.get(getRepositoryToken(TestEntity))
    client = testModule.get(Client)
  })

  after(async () => {
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

    await waitForTypesenseFound(async () => searchCompanyByEmployees(client, 'employees:>1000'), 1)
  })

  it(`find after update`, async () => {
    const entity = await repository.save(
      repository.create({
        company: 'Stark Corp',
        employees: 10,
      })
    )

    await waitForTypesenseFound(async () => searchCompanyByEmployees(client, 'employees:=10'), 1)

    entity.employees = 1031

    await repository.save(entity)

    await waitForTypesenseFound(async () => searchCompanyByEmployees(client, 'employees:>1000'), 2)
  })
})
