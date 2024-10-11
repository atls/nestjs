import type { CheckManager }                   from '../check-manager/index.js'
import type { BatchQueueOptions }              from './batch-queue.interface.js'
import type { QueueName }                      from './batch-queue.types.js'
import type { ProcessorFn }                    from './batch-queue.types.js'
import type { AddCond }                        from './batch-queue.types.js'
import type { AddManyCond }                    from './batch-queue.types.js'

import { MaxQueueCountError }                  from '../errors/index.js'
import { MaxQueueLengthExceededError }         from '../errors/index.js'
import { MaxTotalLengthOfQueuesExceededError } from '../errors/index.js'
import { CheckFailedError }                    from '../errors/index.js'
import { Mutex }                               from './mutex.js'

export class BatchQueue<T> {
  private queues: Map<QueueName, Array<T>> = new Map()

  private totalQueueLength: number = 0

  private timers: Map<QueueName, NodeJS.Timeout> = new Map()

  private processorFn: ProcessorFn<T>

  private mutexes: Map<QueueName, Mutex> = new Map()

  constructor(
    private readonly options: BatchQueueOptions,
    private readonly checkManager: CheckManager
  ) {}

  /**
   * Add a single item to the specified queue.
   * If the queue reaches its length limit, it triggers processing of the queue.
   *
   * @param {AddCond<T>} addCond - The condition containing the queue name and the item to add.
   * @throws {MaxQueueCountError} - Thrown if the maximum number of queues is exceeded.
   * @throws {MaxQueueLengthExceededError} - Thrown if the queue length limit is exceeded.
   * @throws {MaxTotalLengthOfQueuesExceededError} - Thrown if the total length of all queues exceeds the limit.
   * @throws {CheckFailedError} - Thrown if a check fails during item addition.
   */
  public async add(addCond: AddCond<T>): Promise<void> {
    await this.addMany({
      queueName: addCond.queueName,
      items: [addCond.item],
    })
  }

  /**
   * Adds multiple items to the specified queue.
   * If the queue reaches its length limit, it triggers processing of the queue.
   *
   * @param {AddManyCond<T>} addManyCond - The condition containing the queue name and the items to add.
   * @throws {MaxQueueCountError} - Thrown if the maximum number of queues is exceeded.
   * @throws {MaxQueueLengthExceededError} - Thrown if the queue length limit is exceeded.
   * @throws {MaxTotalLengthOfQueuesExceededError} - Thrown if the total length of all queues exceeds the limit.
   * @throws {CheckFailedError} - Thrown if a check fails during item addition.
   */
  public async addMany(addManyCond: AddManyCond<T>): Promise<void> {
    const unlock = await this.getMutex(addManyCond.queueName).lock()
    try {
      const goodState = this.checkManager.getState()
      if (!goodState) throw new CheckFailedError()

      const { queueName, items } = addManyCond

      if (!this.queues.has(queueName)) {
        if (this.queues.size >= this.options.maxQueues) {
          throw new MaxQueueCountError()
        }
        this.queues.set(queueName, [])
      }

      const queue = this.queues.get(queueName)
      if (!queue) return

      if (queue.length + items.length > this.options.maxQueueLength) {
        await this.triggerProcessing(queueName)
        throw new MaxQueueLengthExceededError()
      }

      const totalQueueWithItemsLength = this.totalQueueLength + items.length
      if (totalQueueWithItemsLength > this.options.maxTotalQueueLength) {
        await this.triggerProcessing(queueName)
        throw new MaxTotalLengthOfQueuesExceededError()
      }

      queue.push(...items)
      this.totalQueueLength += items.length

      this.startTimerIfNecessary(queueName)
    } finally {
      unlock()
    }
  }

  /**
   * Sets a function to process batches from the queues.
   *
   * @param {ProcessorFn<T>} processorFn - A function that processes items in the queue.
   */
  public processBatch(processorFn: ProcessorFn<T>): void {
    this.processorFn = processorFn
  }

  private startTimerIfNecessary(queueName: QueueName): void {
    if (this.timers.has(queueName)) return

    const timer = setTimeout(() => {
      this.triggerProcessing(queueName)
    }, this.options.timeoutDuration)

    this.timers.set(queueName, timer)
  }

  private async triggerProcessing(queueName: QueueName): Promise<void> {
    const timer = this.timers.get(queueName)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(queueName)
    }

    const items = this.queues.get(queueName)
    if (items && items.length > 0) {
      this.queues.delete(queueName)
      this.totalQueueLength -= items.length
      await this.processorFn(queueName, items)
    }

    this.mutexes.delete(queueName)
  }

  private getMutex(queueName: QueueName): Mutex {
    if (!this.mutexes.has(queueName)) {
      this.mutexes.set(queueName, new Mutex())
    }
    return this.mutexes.get(queueName)!
  }
}
