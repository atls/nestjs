/* eslint-disable n/no-unsupported-features/node-builtins */

import type { Mock }                           from 'node:test'

import type { ProcessorFn }                    from './batch-queue.types.js'

import assert                                  from 'node:assert/strict'
import { after }                               from 'node:test'
import { before }                              from 'node:test'
import { beforeEach }                          from 'node:test'
import { describe }                            from 'node:test'
import { it }                                  from 'node:test'
import { mock }                                from 'node:test'

import { CheckManager }                        from '../check-manager/index.js'
import { MaxQueueLengthExceededError }         from '../errors/index.js'
import { MaxTotalLengthOfQueuesExceededError } from '../errors/index.js'
import { MaxQueueCountError }                  from '../errors/index.js'
import { CheckFailedError }                    from '../errors/index.js'
import { BatchQueue }                          from './batch-queue.js'

describe('BatchQueue', () => {
  const defaultOptions = {
    maxQueueLength: 5,
    maxTotalQueueLength: 10,
    maxQueues: 3,
    timeoutDuration: 1000,
  }

  let processorFnMock: Mock<ProcessorFn<string>>

  let batchQueue: BatchQueue<string>
  let checkManager: CheckManager

  before(() => {
    mock.timers.enable()
  })

  after(() => {
    mock.timers.reset()
  })

  beforeEach(() => {
    processorFnMock = mock.fn()
  })

  beforeEach(() => {
    checkManager = new CheckManager()
    batchQueue = new BatchQueue<string>(defaultOptions, checkManager)
  })

  it('should add items to the queue and trigger processing when timeout happens', async () => {
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item1', 'item2'] })

    assert.strictEqual(processorFnMock.mock.callCount(), 0)

    mock.timers.tick(defaultOptions.timeoutDuration)

    assert.deepEqual(processorFnMock.mock.calls[0].arguments, ['testQueue', ['item1', 'item2']])
  })

  it('should throw MaxQueueLengthExceededError when adding more items than allowed in a queue', async () => {
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({
      queueName: 'testQueue',
      items: ['item1', 'item2', 'item3', 'item4', 'item5'],
    })

    await assert.rejects(
      batchQueue.addMany({ queueName: 'testQueue', items: ['item6'] }),
      MaxQueueLengthExceededError
    )
  })

  it('should throw MaxTotalLengthOfQueuesExceededError when total items across all queues exceed limit', async () => {
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'queue1', items: ['item1', 'item2', 'item3'] })
    await batchQueue.addMany({ queueName: 'queue2', items: ['item1', 'item2', 'item3', 'item4'] })

    await assert.rejects(
      batchQueue.addMany({ queueName: 'queue4', items: ['item1', 'item2', 'item3', 'item4'] }),
      MaxTotalLengthOfQueuesExceededError
    )
  })

  it('should throw MaxQueueCountError when number of queues exceeds the limit', async () => {
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'queue1', items: ['item1'] })
    await batchQueue.addMany({ queueName: 'queue2', items: ['item1'] })
    await batchQueue.addMany({ queueName: 'queue3', items: ['item1'] })

    await assert.rejects(
      batchQueue.addMany({ queueName: 'queue4', items: ['item1'] }),
      MaxQueueCountError
    )
  })

  it('should throw CheckFailedError if checks are not passing before adding items', async () => {
    batchQueue.processBatch(processorFnMock)

    const getStateSpy = mock.method(checkManager, 'getState', () => false)

    await assert.rejects(
      batchQueue.addMany({ queueName: 'testQueue', items: ['item1'] }),
      CheckFailedError
    )

    getStateSpy.mock.mockImplementation(() => true)

    await assert.doesNotReject(batchQueue.addMany({ queueName: 'testQueue', items: ['item2'] }))
  })

  it('should handle slow batch processing correctly without duplicate processing', async () => {
    const slowProcessorFn = mock.fn(
      async () =>
        new Promise((resolve) => {
          setTimeout(resolve, 2000)
        })
    ) as Mock<ProcessorFn<string>>

    batchQueue.processBatch(slowProcessorFn)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item1', 'item2'] })

    mock.timers.tick(1000)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item3', 'item4'] })

    mock.timers.tick(2000)

    assert.strictEqual(slowProcessorFn.mock.callCount(), 2)
  })
})
