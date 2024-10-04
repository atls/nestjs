import type { QueueName }  from '../batch-queue/batch-queue.interface.js'
import type { BatchQueue } from '../batch-queue/batch-queue.js'

export class Producer<T> {
  constructor(private batchQueue: BatchQueue<T>) {}

  async produce(queueName: QueueName, data: T): Promise<void> {
    await this.batchQueue.add({ queueName, item: data })
  }
}
