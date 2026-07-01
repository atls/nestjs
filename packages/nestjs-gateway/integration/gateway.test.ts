import type { MeshPubSub }                                          from '@graphql-mesh/types'
import type { INestApplication }                                    from '@nestjs/common'
import type { INestMicroservice }                                   from '@nestjs/common'

import type { GatewaySourceType as GatewaySourceTypeEnum }          from '../src/index.js'
import type { GATEWAY_MESH_PUBSUB as GatewayMeshPubSubToken }       from '../src/index.js'
import type { GATEWAY_MODULE_OPTIONS as GatewayModuleOptionsToken } from '../src/index.js'
import type { SubscriptionResult }                                  from './interfaces.js'
import type { ApplicationModule as ApplicationModuleType }          from './src/index.js'
import type { ServiceModule as ServiceModuleType }                  from './src/index.js'

import assert                                                       from 'node:assert/strict'
import path                                                         from 'node:path'
import { before }                                                   from 'node:test'
import { after }                                                    from 'node:test'
import { describe }                                                 from 'node:test'
import { it }                                                       from 'node:test'
import { fileURLToPath }                                            from 'node:url'

import { Transport }                                                from '@nestjs/microservices'
import { Test }                                                     from '@nestjs/testing'
import { WebSocket }                                                from 'ws'
import { buildClientSchema }                                        from 'graphql'
import { printSchema }                                              from 'graphql'
import { getIntrospectionQuery }                                    from 'graphql'
import { createClient }                                             from 'graphql-ws'
import getPort                                                      from 'get-port'
import request                                                      from 'supertest'

const moduleDir = path.dirname(fileURLToPath(import.meta.url))
const SUBSCRIPTION_TIMEOUT = 10000
const SUBSCRIPTION_TOPIC = 'eventTriggered'

const withTimeout = async <T>(promise: Promise<T>, message: string): Promise<T> => {
  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(message))
        }, SUBSCRIPTION_TIMEOUT)
      }),
    ])
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

const createSubscriptionReadyTracker = (meshPubSub: MeshPubSub, triggerName: string) => {
  const originalSubscribe = meshPubSub.subscribe
  const originalAsyncIterator = meshPubSub.asyncIterator
  const subscribe = originalSubscribe.bind(meshPubSub)
  const asyncIterator = originalAsyncIterator.bind(meshPubSub)

  let markReady!: () => void
  let isReady = false

  const ready = new Promise<void>((resolve) => {
    markReady = () => {
      if (!isReady) {
        isReady = true
        resolve()
      }
    }
  })

  const trackReady = (trigger: string) => {
    if (trigger === triggerName) {
      markReady()
    }
  }

  meshPubSub.subscribe = ((trigger, onMessage, options) => {
    trackReady(trigger)

    return subscribe(trigger, onMessage, options)
  }) as MeshPubSub['subscribe']

  meshPubSub.asyncIterator = ((trigger) => {
    trackReady(trigger)

    return asyncIterator(trigger)
  }) as MeshPubSub['asyncIterator']

  return {
    ready,
    restore: () => {
      meshPubSub.subscribe = originalSubscribe
      meshPubSub.asyncIterator = originalAsyncIterator
    },
  }
}

describe('gateway', () => {
  let GatewaySourceType: typeof GatewaySourceTypeEnum
  let GATEWAY_MESH_PUBSUB: typeof GatewayMeshPubSubToken
  let GATEWAY_MODULE_OPTIONS: typeof GatewayModuleOptionsToken
  let ApplicationModule: typeof ApplicationModuleType
  let ServiceModule: typeof ServiceModuleType

  let service: INestMicroservice
  let app: INestApplication
  let pubsub: MeshPubSub
  let url: string

  before(async () => {
    const gatewayCore = await import('../src/index.js')
    const gatewayIntegration = await import('./src/index.js')

    GatewaySourceType = gatewayCore.GatewaySourceType
    GATEWAY_MESH_PUBSUB = gatewayCore.GATEWAY_MESH_PUBSUB
    GATEWAY_MODULE_OPTIONS = gatewayCore.GATEWAY_MODULE_OPTIONS
    ApplicationModule = gatewayIntegration.ApplicationModule
    ServiceModule = gatewayIntegration.ServiceModule

    const servicePort = await getPort()
    const appPort = await getPort()

    const applicationTestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
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
                file: path.join(moduleDir, 'src/service.proto'),
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

    const serviceTestingModule = await Test.createTestingModule({
      imports: [ServiceModule],
    }).compile()

    app = applicationTestingModule.createNestApplication()

    service = serviceTestingModule.createNestMicroservice({
      transport: Transport.GRPC,
      options: {
        package: ['tech.atls'],
        protoPath: [path.join(moduleDir, 'src/service.proto')],
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

    await service.init()

    await app.listen(appPort, '0.0.0.0')
    await service.listen()

    pubsub = app.get(GATEWAY_MESH_PUBSUB)
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

  it('check subscriptions', async () => {
    let openConnection!: () => void
    const connected = new Promise<void>((resolve) => {
      openConnection = resolve
    })
    const subscriptionReady = createSubscriptionReadyTracker(pubsub, SUBSCRIPTION_TOPIC)

    const client = createClient({
      url: url.replace('http:', 'ws:'),
      webSocketImpl: WebSocket,
      on: {
        connected: openConnection,
      },
    })

    let dispose: (() => void) | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined

    const disposeClient = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      dispose?.()
      client.dispose()
    }

    const event = new Promise<SubscriptionResult>((resolve, reject) => {
      timeout = setTimeout(() => {
        disposeClient()
        reject(new Error('Subscription result missing'))
      }, SUBSCRIPTION_TIMEOUT)

      dispose = client.subscribe(
        {
          query: `subscription onEventTriggered {
              eventTriggered {
                  id
              }
          }`,
        },
        {
          next: (data) => {
            clearTimeout(timeout)
            disposeClient()
            resolve(data as SubscriptionResult)
          },
          error: (error) => {
            clearTimeout(timeout)
            disposeClient()
            reject(error)
          },
          complete: () => {
            clearTimeout(timeout)
            disposeClient()
            reject(new Error('Subscription completed before result'))
          },
        }
      )
    })

    let eventAwaited = false

    try {
      await withTimeout(connected, 'WebSocket connection missing')
      await withTimeout(subscriptionReady.ready, 'Subscription was not registered')
      pubsub.publish(SUBSCRIPTION_TOPIC, { id: 'test' })

      eventAwaited = true
      const result = await event
      assert.deepStrictEqual(result, {
        data: {
          eventTriggered: {
            id: 'test',
          },
        },
      })
    } finally {
      subscriptionReady.restore()

      if (!eventAwaited) {
        event.catch(() => undefined)
      }

      disposeClient()
    }
  })
})
