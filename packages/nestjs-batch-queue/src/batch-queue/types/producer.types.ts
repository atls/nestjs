import { QueueName } from './batch-queue.types.js'

export type AddCond<T> = {
  queueName: QueueName
  item: T
}
export type AddManyCond<T> = {
  queueName: QueueName
  items: Array<T>
}
