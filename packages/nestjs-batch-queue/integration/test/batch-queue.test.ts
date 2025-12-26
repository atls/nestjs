import type { INestApplication }     from '@nestjs/common'
import type { ChannelWrapper }       from 'amqp-connection-manager'
import type { Channel }              from 'amqplib'
import type { StartedTestContainer } from 'testcontainers'

import type { Producer }             from '../../src/index.js'
import type { Consumer }             from '../../src/index.js'
import type { Checker }              from '../../src/index.js'
import type { StateHandler }         from '../../src/index.js'
import type { ChangeStateCallback }  from '../../src/index.js'

import assert                        from 'node:assert/strict'
import { after }                     from 'node:test'
import { before }                    from 'node:test'
import { beforeEach }                from 'node:test'
import { describe }                  from 'node:test'
import { it }                        from 'node:test'
import { mock }                      from 'node:test'

import { Test }                      from '@nestjs/testing'
import { GenericContainer }          from 'testcontainers'
import { Wait }                      from 'testcontainers'
import amqp                          from 'amqp-connection-manager'

import { BatchQueueModule }          from '../../src/index.js'
import { BATCH_QUEUE_CONSUMER }      from '../../src/index.js'
import { BATCH_QUEUE_PRODUCER }      from '../../src/index.js'
import { BATCH_QUEUE_CHECKER }       from '../../src/index.js'
import { BATCH_QUEUE_STATE_HANDLER } from '../../src/index.js'
import { BaseQueueError }            from '../../src/index.js'
import { waitForConsumeCount }       from './helpers/index.js'

describe('external renderer', () => {
  let app: INestApplication
  let rabbitmq: StartedTestContainer
  let channelWrapper: ChannelWrapper
  let consumeBatchs: Array<[string, Array<string>]> = []
  let consumeFn: (queueName: string, value: Array<string>) => Promise<void>
  let succesProduceCount = 0

  before(async () => {
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
              timeoutDuration: 2_000,
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
        const producer: Producer<string> = app.get(BATCH_QUEUE_PRODUCER)
        const parsed: { queueName: string; value: string } = JSON.parse(msg.content.toString())
        try {
          await producer.produce(parsed.queueName, parsed.value)
          succesProduceCount += 1
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

    const batchConsumer: Consumer<string> = app.get(BATCH_QUEUE_CONSUMER)
    consumeFn = async (queueName: string, value: Array<string>): Promise<void> => {
      consumeBatchs.push([queueName, value])
    }
    batchConsumer.consume(consumeFn)
  })

  after(async () => {
    await app.close()
    await rabbitmq.stop()
    // eslint-disable-next-line n/no-process-exit
    process.exit(process.exitCode ?? 0)
  })

  beforeEach(async () => {
    await channelWrapper.purgeQueue('test-queue')
    consumeBatchs = []
    succesProduceCount = 0
  })

  it('base test', async () => {
    await channelWrapper.sendToQueue(
      'test-queue',
      Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: 'test-0-0' }))
    )
    await waitForConsumeCount(1, consumeBatchs)
    assert.strictEqual(consumeBatchs.length, 1)
    const result = consumeBatchs.pop()!
    assert.strictEqual(result[0], 'batch-queue')
    assert.deepEqual(result[1], ['test-0-0'])
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
    await waitForConsumeCount(1, consumeBatchs)
    assert.strictEqual(consumeBatchs.length, 1)
    const result = consumeBatchs.pop()!
    assert.strictEqual(result[0], 'batch-queue')
    const expectMessages = []
    for (let i = 0; i < 9_000; i += 1) {
      expectMessages.push(`test-1-${i}`)
    }
    assert.deepEqual(result[1], expectMessages)
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
    await waitForConsumeCount(1, consumeBatchs)
    assert.strictEqual(consumeBatchs.length, 1)
    const result = consumeBatchs.pop()!
    assert.strictEqual(result[0], 'batch-queue')
    const expectMessages = []
    for (let i = 0; i < 10_000; i += 1) {
      expectMessages.push(`test-2-${i}`)
    }
    assert.deepEqual(result[1], expectMessages)
  })

  it('handle multiple queues', async () => {
    const messages: Array<Promise<unknown>> = []
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

    await waitForConsumeCount(3, consumeBatchs)
    assert.strictEqual(consumeBatchs.length, 3)
    consumeBatchs.forEach((result) => {
      assert.strictEqual(result[1].length, 3_000)
      assert.deepEqual(result[1], expectedResults[result[0]])
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

    await waitForConsumeCount(2, consumeBatchs)

    assert.strictEqual(consumeBatchs.length, 2)
    assert.strictEqual(consumeBatchs[0][1].length, 10_000)
    assert.strictEqual(consumeBatchs[1][1].length, 2_000)
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

    await waitForConsumeCount(4, consumeBatchs)

    assert.strictEqual(consumeBatchs.length, 4)
    assert.strictEqual(consumeBatchs[0][1].length, 10_000)
    assert.strictEqual(consumeBatchs[1][1].length, 10_000)
    assert.strictEqual(consumeBatchs[2][1].length, 2_000)
    assert.strictEqual(consumeBatchs[3][1].length, 2_000)
  })

  it('should not consume batches when batch queue is unavailable', async () => {
    const checker: Checker = app.get(BATCH_QUEUE_CHECKER)
    checker.createCheck('mock-memory-1', false)
    const stateHandler: StateHandler = app.get(BATCH_QUEUE_STATE_HANDLER)
    const fnChangeState = mock.fn<ChangeStateCallback>()
    stateHandler.handleChangeState('mock-memory-1', fnChangeState)
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
    assert.strictEqual(succesProduceCount, 0)
    assert.strictEqual(fnChangeState.mock.callCount(), 0)
    await checker.changeState('mock-memory-1', true)
    await waitForConsumeCount(1, consumeBatchs)
  })

  it('should not consume batches when batch queue is unavailable and then recover', async () => {
    const checker: Checker = app.get(BATCH_QUEUE_CHECKER)
    const stateHandler: StateHandler = app.get(BATCH_QUEUE_STATE_HANDLER)
    const fnChangeState = mock.fn<ChangeStateCallback>()
    checker.createCheck('mock-memory-2', false)
    stateHandler.handleChangeState('mock-memory-2', fnChangeState)
    const messages = []
    for (let i = 0; i < 12_000; i += 1) {
      messages.push(
        channelWrapper.sendToQueue(
          'test-queue',
          Buffer.from(JSON.stringify({ queueName: 'batch-queue', value: `test-${i}` }))
        )
      )
    }
    assert.strictEqual(succesProduceCount, 0)
    await Promise.all(messages)
    assert.strictEqual(consumeBatchs.length, 0)
    await checker.changeState('mock-memory-2', true)
    assert.strictEqual(fnChangeState.mock.callCount(), 1)
    assert.deepEqual(fnChangeState.mock.calls[0].arguments, [true])
    await waitForConsumeCount(2, consumeBatchs)
    assert.strictEqual(consumeBatchs.length, 2)
    assert.strictEqual(consumeBatchs[0][1].length, 10_000)
    assert.strictEqual(consumeBatchs[1][1].length, 2_000)
  })
})
