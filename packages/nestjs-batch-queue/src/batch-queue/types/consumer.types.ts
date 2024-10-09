import type { QueueName } from './batch-queue.types.js'

export type ProcessorFn<T> = (queueName: QueueName, item: Array<T>) => Promise<void>
