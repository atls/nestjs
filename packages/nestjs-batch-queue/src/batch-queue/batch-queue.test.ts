import type { ProcessorFn }                    from './batch-queue.interface.js'
import type { OnChangeStateToOkCallback }      from './batch-queue.interface.js'

import { jest }                                from '@jest/globals'
import { beforeEach }                          from '@jest/globals'
import { beforeAll }                           from '@jest/globals'
import { describe }                            from '@jest/globals'
import { it }                                  from '@jest/globals'
import { expect }                              from '@jest/globals'

import { BatchQueue }                          from './batch-queue.js'
import { MaxQueueLengthExceededError }         from './errors/index.js'
import { MaxTotalLengthOfQueuesExceededError } from './errors/index.js'
import { MaxQueueCountError }                  from './errors/index.js'
import { CheckFailedError }                    from './errors/index.js'

describe('BatchQueue', () => {
  const defaultOptions = {
    maxQueueLength: 5,
    maxTotalQueueLength: 10,
    maxQueues: 3,
    timeoutDuration: 1000,
  }

  let processorFnMock: ProcessorFn<string>

  beforeAll(() => {
    jest.useFakeTimers()
  })

  beforeEach(() => {
    // @ts-expect-error
    processorFnMock = jest.fn()
  })

  it('should add items to the queue and trigger processing when timeout happens', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item1', 'item2'] })

    expect(processorFnMock).not.toHaveBeenCalled()

    jest.advanceTimersByTime(defaultOptions.timeoutDuration)

    expect(processorFnMock).toHaveBeenCalledWith('testQueue', ['item1', 'item2'])
  })

  it('should throw MaxQueueLengthExceededError when adding more items than allowed in a queue', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({
      queueName: 'testQueue',
      items: ['item1', 'item2', 'item3', 'item4', 'item5'],
    })

    await expect(batchQueue.addMany({ queueName: 'testQueue', items: ['item6'] })).rejects.toThrow(
      MaxQueueLengthExceededError
    )
  })

  it('should throw MaxTotalLengthOfQueuesExceededError when total items across all queues exceed limit', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'queue1', items: ['item1', 'item2', 'item3'] })
    await batchQueue.addMany({ queueName: 'queue2', items: ['item1', 'item2', 'item3', 'item4'] })

    await expect(
      batchQueue.addMany({ queueName: 'queue4', items: ['item1', 'item2', 'item3', 'item4'] })
    ).rejects.toThrow(MaxTotalLengthOfQueuesExceededError)
  })

  it('should throw MaxQueueCountError when number of queues exceeds the limit', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    await batchQueue.addMany({ queueName: 'queue1', items: ['item1'] })
    await batchQueue.addMany({ queueName: 'queue2', items: ['item1'] })
    await batchQueue.addMany({ queueName: 'queue3', items: ['item1'] })

    await expect(batchQueue.addMany({ queueName: 'queue4', items: ['item1'] })).rejects.toThrow(
      MaxQueueCountError
    )
  })

  it('should correctly handle check failure and trigger fail callbacks', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    const failCallback = jest.fn() as OnChangeStateToOkCallback
    batchQueue.onChangeTotalStateToFail(failCallback)

    const check = batchQueue.createCheck('testCheck', true)
    await check.checkFail()

    expect(failCallback).toHaveBeenCalled()
  })

  it('should correctly handle check success and trigger ok callbacks', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    const okCallback = jest.fn() as OnChangeStateToOkCallback
    batchQueue.onChangeTotalStateToOk(okCallback)

    const check = batchQueue.createCheck('testCheck', false)
    check.checkOk()

    expect(okCallback).toHaveBeenCalled()
  })

  it('should throw CheckFailedError if checks are not passing before adding items', async () => {
    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(processorFnMock)

    const check = batchQueue.createCheck('testCheck', false)

    await expect(batchQueue.addMany({ queueName: 'testQueue', items: ['item1'] })).rejects.toThrow(
      CheckFailedError
    )

    check.checkOk()

    await expect(
      batchQueue.addMany({ queueName: 'testQueue', items: ['item2'] })
    ).resolves.not.toThrow()
  })

  it('should handle slow batch processing correctly without duplicate processing', async () => {
    jest.useFakeTimers()

    const slowProcessorFn = jest.fn().mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(resolve, 2000)
        })
    ) as ProcessorFn<string>

    const batchQueue = new BatchQueue<string>(defaultOptions)
    batchQueue.processBatch(slowProcessorFn)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item1', 'item2'] })

    jest.advanceTimersByTime(1000)

    await batchQueue.addMany({ queueName: 'testQueue', items: ['item3', 'item4'] })

    jest.advanceTimersByTime(2000)

    expect(slowProcessorFn).toHaveBeenCalledTimes(2)
  })
})
