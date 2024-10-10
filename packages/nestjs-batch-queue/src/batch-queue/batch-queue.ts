import type { BatchQueueOptions }              from './batch-queue.interface.js'
import type { QueueName }                      from './types/index.js'
import type { CheckName }                      from './types/index.js'
import type { OnChangeStateToOkCallback }      from './types/index.js'
import type { OnChangeStateToFailCallback }    from './types/index.js'
import type { ProcessorFn }                    from './types/index.js'
import type { AddCond }                        from './types/index.js'
import type { AddManyCond }                    from './types/index.js'
import type { Checks }                         from './types/index.js'
import type { CheckOk }                        from './types/index.js'
import type { CheckFail }                      from './types/index.js'
import type { CheckOnAdd }                     from './types/index.js'
import type { OnAddConfig }                    from './types/index.js'

import { MaxQueueCountError }                  from '../errors/index.js'
import { MaxQueueLengthExceededError }         from '../errors/index.js'
import { MaxTotalLengthOfQueuesExceededError } from '../errors/index.js'
import { CheckFailedError }                    from '../errors/index.js'
import { Mutex }                               from './mutex.js'

export class BatchQueue<T> {
  private queues: Map<QueueName, Array<T>> = new Map()

  private checkStates: Map<
    CheckName,
    {
      state: boolean
      onAddConfig?: OnAddConfig
    }
  > = new Map()

  private onOkCallbacks: Array<OnChangeStateToOkCallback> = []

  private onFailCallbacks: Array<OnChangeStateToFailCallback> = []

  private options: BatchQueueOptions

  private totalQueueLength: number = 0

  private timers: Map<QueueName, NodeJS.Timeout> = new Map()

  private processorFn: ProcessorFn<T>

  private mutexes: Map<QueueName, Mutex> = new Map()

  constructor(options: BatchQueueOptions) {
    this.options = options
  }

  public async add(addCond: AddCond<T>): Promise<void> {
    await this.addMany({
      queueName: addCond.queueName,
      items: [addCond.item],
    })
  }

  public async addMany(addManyCond: AddManyCond<T>): Promise<void> {
    const unlock = await this.getMutex(addManyCond.queueName).lock()
    try {
      this.checkAllChecks()

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

      await this.checkOnAddChecks(items.length)

      queue.push(...items)
      this.totalQueueLength += items.length

      this.startTimerIfNecessary(queueName)
    } finally {
      unlock()
    }
  }

  public processBatch(processorFn: ProcessorFn<T>): void {
    this.processorFn = processorFn
  }

  public createCheck(checkName: CheckName, initialState: boolean): Checks {
    if (!this.checkStates.has(checkName)) {
      this.checkStates.set(checkName, { state: initialState })
    }

    const checkOk: CheckOk = async () => {
      const beforeTotalCheck = this.totalCheck()
      const checkState = this.checkStates.get(checkName)
      if (checkState) {
        checkState.state = true
      }
      if (beforeTotalCheck) return
      const afterTotalCheck = this.totalCheck()
      if (afterTotalCheck) {
        await this.triggerOkCallbacks()
      }
    }

    const checkFail: CheckFail = async () => {
      const beforeTotalCheck = this.totalCheck()
      const checkState = this.checkStates.get(checkName)
      if (checkState) {
        checkState.state = false
      }
      if (!beforeTotalCheck) return
      const afterTotalCheck = this.totalCheck()
      if (!afterTotalCheck) {
        await this.triggerFailCallbacks()
      }
    }

    return { checkOk, checkFail }
  }

  public createCheckOnAdd(
    checkName: CheckName,
    checkOnAdd: CheckOnAdd,
    checkEveryItem: number
  ): void {
    if (!this.checkStates.has(checkName)) {
      this.checkStates.set(checkName, { state: true })
    }
    const checkState = this.checkStates.get(checkName)!
    checkState.onAddConfig = { checkOnAdd, checkEveryItem, currentItemCounter: 0 }
  }

  public onChangeTotalStateToOk(callback: OnChangeStateToOkCallback): void {
    this.onOkCallbacks.push(callback)
  }

  public onChangeTotalStateToFail(callback: OnChangeStateToFailCallback): void {
    this.onFailCallbacks.push(callback)
  }

  private totalCheck(): boolean {
    for (const { state } of this.checkStates.values()) {
      if (!state) {
        return false
      }
    }
    return true
  }

  private checkAllChecks(): void {
    const failedChecks = []
    for (const [checkName, { state }] of this.checkStates.entries()) {
      if (!state) {
        failedChecks.push(checkName)
      }
    }
    if (failedChecks.length > 0) {
      throw new CheckFailedError(failedChecks)
    }
  }

  private async checkOnAddChecks(itemsLength: number): Promise<void> {
    for (const [checkName, { onAddConfig }] of this.checkStates.entries()) {
      // eslint-disable-next-line no-continue
      if (!onAddConfig) continue

      const { checkOnAdd, checkEveryItem, currentItemCounter } = onAddConfig
      let itemCounter = currentItemCounter + itemsLength

      while (itemCounter >= checkEveryItem) {
        // eslint-disable-next-line no-await-in-loop
        const okCheck = await checkOnAdd()

        if (!okCheck) {
          throw new CheckFailedError([checkName])
        }

        itemCounter -= checkEveryItem
      }
      onAddConfig.currentItemCounter = itemCounter
    }
  }

  private startTimerIfNecessary(queueName: QueueName): void {
    if (this.timers.has(queueName)) {
      clearTimeout(this.timers.get(queueName))
    }

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

  private async triggerOkCallbacks(): Promise<void> {
    const promises = Promise.all(this.onOkCallbacks.map(async (callback) => callback()))
    await promises
  }

  private async triggerFailCallbacks(): Promise<void> {
    const promises = Promise.all(this.onFailCallbacks.map(async (callback) => callback()))
    await promises
  }

  private getMutex(queueName: QueueName): Mutex {
    if (!this.mutexes.has(queueName)) {
      this.mutexes.set(queueName, new Mutex())
    }
    return this.mutexes.get(queueName)!
  }
}
