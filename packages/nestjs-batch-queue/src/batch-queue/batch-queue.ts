import type { BatchQueueI }                    from './batch-queue.interface.js'
import type { QueueName }                      from './batch-queue.interface.js'
import type { CheckName }                      from './batch-queue.interface.js'
import type { OnChangeStateToOkCallback }      from './batch-queue.interface.js'
import type { OnChangeStateToFailCallback }    from './batch-queue.interface.js'
import type { ProcessorFn }                    from './batch-queue.interface.js'
import type { AddCond }                        from './batch-queue.interface.js'
import type { AddManyCond }                    from './batch-queue.interface.js'
import type { Checks }                         from './batch-queue.interface.js'
import type { CheckOk }                        from './batch-queue.interface.js'
import type { CheckFail }                      from './batch-queue.interface.js'

import { Injectable }                          from '@nestjs/common'

import { BatchQueueOptions }                   from './batch-queue.interface.js'
import { MaxQueueCountError }                  from './errors/index.js'
import { MaxQueueLengthExceededError }         from './errors/index.js'
import { MaxTotalLengthOfQueuesExceededError } from './errors/index.js'
import { CheckFailedError }                    from './errors/index.js'

@Injectable()
export class BatchQueue<T> implements BatchQueueI<T> {
  private queues: Map<QueueName, Array<T>> = new Map()

  private checks: Map<CheckName, boolean> = new Map()

  private onOkCallbacks: Array<OnChangeStateToOkCallback> = []

  private onFailCallbacks: Array<OnChangeStateToFailCallback> = []

  private options: BatchQueueOptions

  private totalQueueLength: number = 0

  private timers: Map<QueueName, NodeJS.Timeout> = new Map()

  private processorFn: ProcessorFn<T>

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

    queue.push(...items)
    this.totalQueueLength += items.length

    this.startTimerIfNecessary(queueName)
  }

  public processBatch(processorFn: ProcessorFn<T>): void {
    this.processorFn = processorFn
  }

  public createCheck(checkName: CheckName, initialState: boolean): Checks {
    this.checks.set(checkName, initialState)

    const checkOk: CheckOk = async () => {
      const beforeTotalCheck = this.totalCheck()
      this.checks.set(checkName, true)
      if (beforeTotalCheck) return
      const afterTotalCheck = this.totalCheck()
      if (afterTotalCheck) {
        await this.triggerOkCallbacks()
      }
    }

    const checkFail: CheckFail = async () => {
      const beforeTotalCheck = this.totalCheck()
      this.checks.set(checkName, false)
      if (!beforeTotalCheck) return
      const afterTotalCheck = this.totalCheck()
      if (!afterTotalCheck) {
        await this.triggerFailCallbacks()
      }
    }

    return { checkOk, checkFail }
  }

  public onChangeTotalStateToOk(callback: OnChangeStateToOkCallback): void {
    this.onOkCallbacks.push(callback)
  }

  public onChangeTotalStateToFail(callback: OnChangeStateToFailCallback): void {
    this.onFailCallbacks.push(callback)
  }

  private totalCheck(): boolean {
    for (const state of this.checks.values()) {
      if (!state) {
        return false
      }
    }
    return true
  }

  private checkAllChecks(): void {
    const failedChecks = []
    for (const [checkName, state] of this.checks.entries()) {
      if (!state) {
        failedChecks.push(checkName)
      }
    }
    if (failedChecks.length > 0) {
      throw new CheckFailedError(failedChecks)
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
      this.queues.set(queueName, [])
      this.totalQueueLength -= items.length
      await this.processorFn(queueName, items)
    }
  }

  private async triggerOkCallbacks(): Promise<void> {
    const promises = Promise.all(this.onOkCallbacks.map(async (callback) => callback()))
    await promises
  }

  private async triggerFailCallbacks(): Promise<void> {
    const promises = Promise.all(this.onFailCallbacks.map(async (callback) => callback()))
    await promises
  }
}
