import type { INestApplication }    from '@nestjs/common'
import type { INestMicroservice }   from '@nestjs/common'

import { Transport }                from '@nestjs/microservices'
import { Test }                     from '@nestjs/testing'
import { describe }                 from '@jest/globals'
import { beforeAll }                from '@jest/globals'
import { it }                       from '@jest/globals'
import { expect }                   from '@jest/globals'
import { afterAll }                 from '@jest/globals'
import { PubSub }                   from 'graphql-subscriptions'
import { WebSocket }                from 'ws'
import { buildClientSchema }        from 'graphql'
import { printSchema }              from 'graphql'
import { getIntrospectionQuery }    from 'graphql'
import { createClient }             from 'graphql-ws'
import getPort                      from 'get-port'
import path                         from 'path'
import request                      from 'supertest'

import { GatewaySourceType }        from '../../src/index.js'
import { GATEWAY_MODULE_OPTIONS }   from '../../src/index.js'
import { GatewayIntegrationModule } from '../src/index.js'

describe('gateway', () => {
  let service: INestMicroservice
  let app: INestApplication
  let pubsub: PubSub
  let url: string

  beforeAll(async () => {
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
                file: path.join(__dirname, '../src/service.proto'),
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
        protoPath: [path.join(__dirname, '../src/service.proto')],
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

  afterAll(async () => {
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

    expect(schema).toContain('getMovies(input: MovieRequest_Input): MoviesResult')
    expect(schema).toContain('GetMetadata(input: GetMetadataRequest_Input): GetMetadataResponse')
    expect(schema).toContain('GetError(input: GetErrorRequest_Input): GetErrorResponse')
    expect(schema).toContain(
      'GetMustRename(input: GetMustRenameRequest_Input): GetMustRenameResponse'
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

    expect(response.body.errors[0].extensions.exception).toEqual(
      expect.objectContaining({
        status: 'INVALID_ARGUMENT',
        code: 3,
        message: 'Test',
      })
    )
  })

  // TODO: check the test and implemenation. Event doesn't resolve
  it.skip('check subscriptions', async () => {
    const client = createClient({
      url: url.replace('http:', 'ws:'),
      webSocketImpl: WebSocket,
    })

    const event = new Promise((resolve, reject) => {
      // @ts-expect-error
      let result

      client.subscribe(
        {
          query: `subscription onEventTriggered {
              eventTriggered {
                  id
              }
          }`,
        },
        {
          // eslint-disable-next-line
          next: (data) => (result = data),
          error: reject,
          complete: () => {
            // @ts-expect-error
            resolve(result)
          },
        }
      )

      pubsub.publish('eventTriggered', { id: 'test' })
    })

    return expect(event).resolves.toEqual({ id: 'test' })
  })
})
