export type QueueName = string
export type ProcessorFn<T> = (queueName: QueueName, item: Array<T>) => Promise<void>
export type AddCond<T> = {
  queueName: QueueName
  item: T
}
export type AddManyCond<T> = {
  queueName: QueueName
  items: Array<T>
}
