import type { INestApplication }                                         from '@nestjs/common'
import type { INestMicroservice }                                        from '@nestjs/common'

import type { GatewaySourceType as GatewaySourceTypeEnum }               from '../../src/index.js'
import type { GATEWAY_MODULE_OPTIONS as GatewayModuleOptionsToken }      from '../../src/index.js'
import type { GatewayIntegrationModule as GatewayIntegrationModuleType } from '../src/index.js'

import assert                                                            from 'node:assert/strict'
import path                                                              from 'node:path'
import { before }                                                        from 'node:test'
import { after }                                                         from 'node:test'
import { describe }                                                      from 'node:test'
import { it }                                                            from 'node:test'
import { fileURLToPath }                                                 from 'node:url'

import { Transport }                                                     from '@nestjs/microservices'
import { Test }                                                          from '@nestjs/testing'
import { PubSub }                                                        from 'graphql-subscriptions'
import { WebSocket }                                                     from 'ws'
import { buildClientSchema }                                             from 'graphql'
import { printSchema }                                                   from 'graphql'
import { getIntrospectionQuery }                                         from 'graphql'
import { createClient }                                                  from 'graphql-ws'
import getPort                                                           from 'get-port'
import request                                                           from 'supertest'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))

// TODO: fix gateway integration test stability and re-enable suite.
describe.skip('gateway', () => {
  let GatewaySourceType: typeof GatewaySourceTypeEnum
  let GATEWAY_MODULE_OPTIONS: typeof GatewayModuleOptionsToken
  let GatewayIntegrationModule: typeof GatewayIntegrationModuleType

  let service: INestMicroservice
  let app: INestApplication
  let pubsub: PubSub
  let url: string

  before(async () => {
    const gatewayCore = await import('../../src/index.js')
    const gatewayIntegration = await import('../src/index.js')

    GatewaySourceType = gatewayCore.GatewaySourceType
    GATEWAY_MODULE_OPTIONS = gatewayCore.GATEWAY_MODULE_OPTIONS
    GatewayIntegrationModule = gatewayIntegration.GatewayIntegrationModule

    const servicePort = await getPort()
    const appPort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [GatewayIntegrationModule],
    })
      .overrideProvider(GATEWAY_MODULE_OPTIONS)
      .useValue({
        playground: true,
        sources: [
          {
            name: 'Movies',
            type: GatewaySourceType.GRPC,
            handler: {
              endpoint: `localhost:${servicePort}`,
              protoFilePath: {
                file: path.join(moduleDir, '../src/service.proto'),
                load: { includeDirs: [] },
              },
              serviceName: 'ExampleService',
              packageName: 'tech.atls',
              metaData: {
                authorization: ['req', 'headers', 'authorization'],
              },
            },
            transforms: {
              rename: {
                mode: 'bare',
                renames: [
                  {
                    from: {
                      type: 'tech_atls_(.*)',
                    },
                    to: {
                      type: '$1',
                    },
                    useRegExpForTypes: true,
                  },
                  {
                    from: {
                      type: 'Mutation',
                      field: 'tech_atls_ExampleService_(.*)',
                    },
                    to: {
                      type: 'Mutation',
                      field: '$1',
                    },
                    useRegExpForTypes: true,
                    useRegExpForFields: true,
                  },
                  {
                    from: {
                      type: 'Query',
                      field: 'tech_atls_ExampleService_(.*)',
                    },
                    to: {
                      type: 'Query',
                      field: '$1',
                    },
                    useRegExpForTypes: true,
                    useRegExpForFields: true,
                  },
                ],
              },
            },
          },
        ],
        additionalTypeDefs: `
          extend schema {
            subscription: Subscription
          }

          type Event {
            id: String!
          }

          type Subscription {
            eventTriggered: Event
          }
        `,
        additionalResolvers: [
          {
            targetTypeName: 'Subscription',
            targetFieldName: 'eventTriggered',
            pubsubTopic: 'eventTriggered',
          },
        ],
      })
      .compile()

    app = testingModule.createNestApplication()

    service = testingModule.createNestMicroservice({
      transport: Transport.GRPC,
      options: {
        package: ['tech.atls'],
        protoPath: [path.join(moduleDir, '../src/service.proto')],
        url: `0.0.0.0:${servicePort}`,
        loader: {
          arrays: true,
          keepCase: true,
          defaults: true,
          oneofs: true,
          includeDirs: [],
        },
      },
    })

    await app.init()
    await service.init()

    await app.listen(appPort, '0.0.0.0')
    await service.listen()

    pubsub = app.get(PubSub)
    url = await app.getUrl()
  })

  after(async () => {
    await service.close()
    await app.close()
  })

  it('check schema', async () => {
    const res = await request(url).post('/').set('Accept', 'application/json').send({
      operationName: 'IntrospectionQuery',
      variables: {},
      query: getIntrospectionQuery(),
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const schema = printSchema(buildClientSchema(res.body.data))

    assert.ok(schema.includes('getMovies(input: MovieRequest_Input): MoviesResult'))
    assert.ok(schema.includes('GetMetadata(input: GetMetadataRequest_Input): GetMetadataResponse'))
    assert.ok(schema.includes('GetError(input: GetErrorRequest_Input): GetErrorResponse'))
    assert.ok(
      schema.includes('GetMustRename(input: GetMustRenameRequest_Input): GetMustRenameResponse')
    )
  })

  it(`get movies`, async () => {
    await request(url)
      .post('/')
      .set('Accept', 'application/json')
      .send({
        operationName: 'Movies',
        variables: {},
        query: 'query Movies {\n  getMovies {\n    result {\n      name\n    }\n  }\n}\n',
      })
      .expect(200, {
        data: {
          getMovies: {
            result: [
              {
                name: 'Mission: Impossible Rogue Nation',
              },
            ],
          },
        },
      })
  })

  it(`get metadata`, async () => {
    await request(url)
      .post('/')
      .set('Accept', 'application/json')
      .set('Authorization', 'test')
      .send({
        operationName: 'Metadata',
        variables: {},
        query: 'query Metadata {\n  GetMetadata {\n    authorization  }\n}\n',
      })
      .expect(200, {
        data: {
          GetMetadata: {
            authorization: 'test',
          },
        },
      })
  })

  it('handle error', async () => {
    const response = await request(url)
      .post('/')
      .set('Accept', 'application/json')
      .set('Authorization', 'test')
      .send({
        operationName: 'Error',
        variables: {},
        query: 'query Error {\n  GetError {\n    result  }\n}\n',
      })

    const exception = response.body.errors?.[0]?.extensions?.exception as
      | { status?: string; code?: number; message?: string }
      | undefined

    assert.strictEqual(exception?.status, 'INVALID_ARGUMENT')
    assert.strictEqual(exception.code, 3)
    assert.strictEqual(exception.message, 'Test')
  })

  // TODO: check the test and implemenation. Event doesn't resolve
  it.skip('check subscriptions', async () => {
    const client = createClient({
      url: url.replace('http:', 'ws:'),
      webSocketImpl: WebSocket,
    })

    const event = new Promise((resolve, reject) => {
      let result: { id: string } | undefined

      client.subscribe(
        {
          query: `subscription onEventTriggered {
              eventTriggered {
                  id
              }
          }`,
        },
        {
          next: (data) => {
            result = data as { id: string }
          },
          error: reject,
          complete: () => {
            if (!result) {
              reject(new Error('Subscription result missing'))
              return
            }
            resolve(result)
          },
        }
      )

      pubsub.publish('eventTriggered', { id: 'test' })
    })

    const result = await event
    assert.deepStrictEqual(result, { id: 'test' })
  })
})
