import type { BatchQueue } from './batch-queue.js'
import type { QueueName }  from './types/index.js'

export class Producer<T> {
  constructor(private batchQueue: BatchQueue<T>) {}

  async produce(queueName: QueueName, data: T): Promise<void> {
    await this.batchQueue.add({ queueName, item: data })
  }
}
