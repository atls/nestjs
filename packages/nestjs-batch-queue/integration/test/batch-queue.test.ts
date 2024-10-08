import type { INestApplication }     from '@nestjs/common'
import type { ChannelWrapper }       from 'amqp-connection-manager'
import type { Channel }              from 'amqplib'
import type { StartedTestContainer } from 'testcontainers'

import type { Producer }             from '../../src/index.js'
import type { Consumer }             from '../../src/index.js'
import type { Checker }              from '../../src/index.js'
import type { StateHandler }         from '../../src/index.js'

import { Test }                      from '@nestjs/testing'
import { describe }                  from '@jest/globals'
import { it }                        from '@jest/globals'
import { expect }                    from '@jest/globals'
import { beforeAll }                 from '@jest/globals'
import { afterAll }                  from '@jest/globals'
import { beforeEach }                from '@jest/globals'
import { jest }                      from '@jest/globals'
import { GenericContainer }          from 'testcontainers'
import { Wait }                      from 'testcontainers'
import amqp                          from 'amqp-connection-manager'

import { BatchQueueModule }          from '../../src/index.js'
import { BATCH_QUEUE_CONSUMER }      from '../../src/index.js'
import { BATCH_QUEUE_PRODUCER }      from '../../src/index.js'
import { BATCH_QUEUE_CHECKER }       from '../../src/index.js'
import { BATCH_QUEUE_STATE_HANDLER } from '../../src/index.js'
import { BaseQueueError }            from '../../src/index.js'

describe('external renderer', () => {
  let app: INestApplication
  let rabbitmq: StartedTestContainer
  let channelWrapper: ChannelWrapper
  let consumeBatchs: Array<[string, Array<string>]> = []
  let consumeFn: (queueName: string, value: Array<string>) => Promise<void>

  beforeAll(async () => {
    rabbitmq = await new GenericContainer('rabbitmq:3-alpine')
      .withWaitStrategy(Wait.forLogMessage('Starting broker'))
      .withExposedPorts(5672)
      .start()

    const testingModule = await Test.createTestingModule({
      imports: [
        BatchQueueModule.registerAsync({
          imports: [],
          useFactory: () => ({
            core: {
              maxQueueLength: 10_000,
              maxTotalQueueLength: 100_000,
              maxQueues: 20,
              timeoutDuration: 1_000,
            },
          }),
          inject: [],
        }),
      ],
    }).compile()

    const connection = amqp.connect([
      `amqp://${rabbitmq.getHost()}:${rabbitmq.getMappedPort(5672)}`,
    ])
    channelWrapper = connection.createChannel({
      json: false,
      confirm: false,
      setup: async (channel: Channel) => {
        await channel.assertQueue('test-queue', {
          durable: true,
        })
      },
    })

    channelWrapper.consume('test-queue', (msg) => {
      ;(async (): Promise<void> => {
        const producer: Producer<any> = app.get(BATCH_QUEUE_PRODUCER)
        const parsed: { queueName: string; value: any } = JSON.parse(msg.content.toString())
        try {
          await producer.produce(parsed.queueName, parsed.value)
          channelWrapper.ack(msg)
        } catch (e) {
          if (e instanceof BaseQueueError) {
            channelWrapper.nack(msg)
          }
        }
      })()
    })

    await channelWrapper.waitForConnect()

    app = testingModule.createNestApplication()
    await app.init()

    const batchConsumer: Consumer = app.get(BATCH_QUEUE_CONSUMER)
    consumeFn = async (queueName: string, value: Array<string>): Promise<void> => {
      consumeBatchs.push([queueName, value])
    }
    batchConsumer.consume(consumeFn)
  })

  afterAll(async () => {
    await app.close()
    await rabbitmq.stop()
  })

  beforeEach(async () => {
    await channelWrapper.purgeQueue('test-queue')
    consumeBatchs = []
  })

  it('base test', async () => {
    await channelWrapper.sendToQueue(
      'test-queue',
      Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: 'test-0-0' }))
    )
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1100)
    })
    expect(consumeBatchs.length).toBe(1)
    const result = consumeBatchs.pop()!
    expect(result[0]).toBe('batch-queue')
    expect(result[1]).toEqual(['test-0-0'])
  })

  it('fill 90% queue', async () => {
    const messages = []
    for (let i = 0; i < 9_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-1-${i}` }))
        )
      )
    }
    await Promise.all(messages)
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })
    expect(consumeBatchs.length).toBe(1)
    const result = consumeBatchs.pop()!
    expect(result[0]).toBe('batch-queue')
    const expectMessages = []
    for (let i = 0; i < 9_000; i += 1) {
      expectMessages.push(`test-1-${i}`)
    }
    expect(result[1]).toEqual(expectMessages)
  })

  it('fullfill queue', async () => {
    const messages = []
    for (let i = 0; i < 10_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-2-${i}` }))
        )
      )
    }
    await Promise.all(messages)
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })
    expect(consumeBatchs.length).toBe(1)
    const result = consumeBatchs.pop()!
    expect(result[0]).toBe('batch-queue')
    const expectMessages = []
    for (let i = 0; i < 10_000; i += 1) {
      expectMessages.push(`test-2-${i}`)
    }
    expect(result[1]).toEqual(expectMessages)
  })

  it('handle multiple queues', async () => {
    const messages: Array<Promise<any>> = []
    const queues: Array<string> = ['queue-one', 'queue-two', 'queue-three']
    const expectedResults: Record<string, Array<string>> = {
      'queue-one': [],
      'queue-two': [],
      'queue-three': [],
    }

    for (let i = 0; i < 3_000; i += 1) {
      // eslint-disable-next-line no-loop-func
      queues.forEach((queue: string) => {
        messages.push(
          channelWrapper.sendToQueue(
            'test-queue',
            Buffer.from(JSON.stringify({ queueName: queue, value: `test-3-${i}` }))
          )
        )
        expectedResults[queue].push(`test-3-${i}`)
      })
    }

    await Promise.all(messages)

    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })

    expect(consumeBatchs.length).toBe(3)
    consumeBatchs.forEach((result) => {
      expect(result[1].length).toBe(3_000)
      expect(result[1]).toEqual(expectedResults[result[0]])
    })
  })

  it('fulfill a single queue with total of 12,000 messages, receiving batches of 10,000 and 2,000', async () => {
    const messages = []

    for (let i = 0; i < 12_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-4-${i}` }))
        )
      )
    }
    await Promise.all(messages)

    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })

    expect(consumeBatchs.length).toBe(2)
    expect(consumeBatchs[0][1].length).toBe(10_000)
    expect(consumeBatchs[1][1].length).toBe(2_000)
  })

  it('two queues with 12,000 messages each', async () => {
    const messages = []

    for (let i = 0; i < 24_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(
            JSON.stringify({
              queueName: i % 2 === 0 ? 'queue-one' : 'queue-two',
              value: `test-5-${i}`,
            })
          )
        )
      )
    }
    await Promise.all(messages)

    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })

    expect(consumeBatchs.length).toBe(4)
    expect(consumeBatchs[0][1].length).toBe(10_000)
    expect(consumeBatchs[1][1].length).toBe(10_000)
    expect(consumeBatchs[2][1].length).toBe(2_000)
    expect(consumeBatchs[3][1].length).toBe(2_000)
  })

  it('should not consume batches when batch queue is unavailable', async () => {
    const checker: Checker = app.get(BATCH_QUEUE_CHECKER)
    const stateHandler: StateHandler = app.get(BATCH_QUEUE_STATE_HANDLER)
    const fnOk = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const fnFail = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    stateHandler.onChangeTotalStateToOk(fnOk)
    stateHandler.onChangeTotalStateToFail(fnFail)
    const checks = checker.createCheck('mock-memory-1', false)
    const messages = []
    for (let i = 0; i < 10_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-6-${i}` }))
        )
      )
    }
    await Promise.all(messages)
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })
    expect(consumeBatchs.length).toBe(0)
    expect(fnOk).toBeCalledTimes(0)
    await checks.checkOk()
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })
  })

  it('should not consume batches when batch queue is unavailable and then recover', async () => {
    const checker: Checker = app.get(BATCH_QUEUE_CHECKER)
    const stateHandler: StateHandler = app.get(BATCH_QUEUE_STATE_HANDLER)
    const fnOk = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const fnFail = jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
    stateHandler.onChangeTotalStateToOk(fnOk)
    stateHandler.onChangeTotalStateToFail(fnFail)
    const checks = checker.createCheck('mock-memory-2', false)
    const messages = []
    for (let i = 0; i < 12_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-${i}` }))
        )
      )
    }
    await Promise.all(messages)
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1200)
    })
    expect(consumeBatchs.length).toBe(0)
    await checks.checkOk()
    expect(fnOk).toBeCalledTimes(1)
    expect(fnFail).toBeCalledTimes(0)
    await new Promise((res) => {
      setTimeout(() => {
        res(null)
      }, 1400)
    })
    expect(consumeBatchs.length).toBe(2)
    expect(consumeBatchs[0][1].length).toBe(10_000)
    expect(consumeBatchs[1][1].length).toBe(2_000)
  })
})
