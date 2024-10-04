export type QueueName = string | symbol
export type CheckName = string | symbol
export type AddCond<T> = {
  queueName: QueueName
  item: T
}
export type AddManyCond<T> = {
  queueName: QueueName
  items: Array<T>
}
export type ProcessorFn<T> = (queueName: QueueName, item: Array<T>) => Promise<void>
export type CheckOnAdd = () => Promise<boolean>
export type CheckOk = () => Promise<void>
export type CheckFail = () => Promise<void>
export type Checks = {
  checkOk: CheckOk
  checkFail: CheckFail
}
export type OnChangeStateToOkCallback = () => Promise<void>
export type OnChangeStateToFailCallback = () => Promise<void>

export interface BatchQueueI<T> {
  add: (addCond: AddCond<T>) => Promise<void>
  addMany: (addManyCond: AddManyCond<T>) => Promise<void>
  processBatch: (processorFn: ProcessorFn<T>) => void
  createCheck: (checkName: CheckName, initialState: boolean) => Checks
  onChangeTotalStateToOk: (callback: OnChangeStateToOkCallback) => void
  onChangeTotalStateToFail: (callback: OnChangeStateToFailCallback) => void
}

export interface BatchQueueOptions {
  maxQueueLength: number
  maxTotalQueueLength: number
  maxQueues: number
  timeoutDuration: number
}
