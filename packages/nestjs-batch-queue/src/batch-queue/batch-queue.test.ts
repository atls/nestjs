import type { ProcessorFn }                    from './batch-queue.interface.js'
import type { OnChangeStateToOkCallback }      from './batch-queue.interface.js'
import type { CheckOnAdd }                     from './batch-queue.interface.js'

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

  it('should not trigger checkOnAdd until the specified number of items is added', async () => {
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const checkOnAdd = jest.fn().mockResolvedValue(true) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 3)

    await batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })

    expect(checkOnAdd).not.toHaveBeenCalled()

    await batchQueue.addMany({ queueName: 'queue1', items: [3] })

    expect(checkOnAdd).toHaveBeenCalledTimes(1)
  })

  it('should throw CheckFailedError if checkOnAdd returns false', async () => {
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const checkOnAdd = jest.fn().mockResolvedValue(false) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 2)

    await expect(batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })).rejects.toThrow(
      CheckFailedError
    )

    expect(checkOnAdd).toHaveBeenCalledTimes(1)
  })

  it('should accumulate currentItemCounter across multiple addMany calls', async () => {
    jest.useFakeTimers()
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const checkOnAdd = jest.fn().mockResolvedValue(true) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 5)

    await batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })
    await batchQueue.addMany({ queueName: 'queue1', items: [3, 4] })

    expect(checkOnAdd).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)

    await batchQueue.addMany({ queueName: 'queue1', items: [5] })

    expect(checkOnAdd).toHaveBeenCalledTimes(1)
  })

  it('should call checkOnAdd after adding the specified number of items across different queues', async () => {
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const checkOnAdd = jest.fn().mockResolvedValue(true) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 5)

    await batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })
    await batchQueue.addMany({ queueName: 'queue2', items: [3, 4] })

    expect(checkOnAdd).not.toHaveBeenCalled()

    await batchQueue.addMany({ queueName: 'queue1', items: [5] })

    expect(checkOnAdd).toHaveBeenCalledTimes(1)
  })

  it('should handle async checkOnAdd correctly', async () => {
    jest.useRealTimers()
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const processorFn = jest.fn().mockResolvedValue(true) as ProcessorFn<number>
    batchQueue.processBatch(processorFn)
    let callInsideAsync = 0
    const checkOnAdd = jest.fn().mockImplementation(
      async () =>
        new Promise((resolve) => {
          setTimeout(() => {
            callInsideAsync += 1
            resolve(true)
          }, 500)
        })
    ) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 3)

    await batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })
    expect(callInsideAsync).toBe(0)
    await batchQueue.addMany({ queueName: 'queue1', items: [3] })

    expect(checkOnAdd).toHaveBeenCalledTimes(1)
    expect(callInsideAsync).toBe(1)
    jest.useFakeTimers()
  })

  it('should handle checkOnAdd failures across multiple queues and throw CheckFailedError', async () => {
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const checkOnAdd1 = jest.fn().mockResolvedValue(true) as CheckOnAdd
    // @ts-expect-error
    const checkOnAdd2 = jest.fn().mockResolvedValue(false) as CheckOnAdd

    batchQueue.createCheckOnAdd('check1', checkOnAdd1, 3)
    batchQueue.createCheckOnAdd('check2', checkOnAdd2, 2)

    await batchQueue.addMany({ queueName: 'queue1', items: [1] })

    await expect(batchQueue.addMany({ queueName: 'queue2', items: [2, 3] })).rejects.toThrow(
      CheckFailedError
    )

    expect(checkOnAdd2).toHaveBeenCalledTimes(1)
  })

  it('should reset checkOnAdd counter after successful check', async () => {
    const batchQueue = new BatchQueue<number>(defaultOptions)
    // @ts-expect-error
    const processorFn = jest.fn().mockResolvedValue(true) as ProcessorFn<number>
    batchQueue.processBatch(processorFn)
    // @ts-expect-error
    const checkOnAdd = jest.fn().mockResolvedValue(true) as CheckOnAdd
    batchQueue.createCheckOnAdd('check1', checkOnAdd, 3)

    await batchQueue.addMany({ queueName: 'queue1', items: [1, 2] })
    await batchQueue.addMany({ queueName: 'queue2', items: [3] })

    expect(checkOnAdd).toHaveBeenCalledTimes(1)

    await batchQueue.addMany({ queueName: 'queue3', items: [4, 5] })

    expect(checkOnAdd).toHaveBeenCalledTimes(2)
  })
})
