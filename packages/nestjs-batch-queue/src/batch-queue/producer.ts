import type { BatchQueue } from './batch-queue.js'
import type { QueueName }  from './types/index.js'

export class Producer<T> {
  constructor(private batchQueue: BatchQueue<T>) {}

  /**
   * Delegates to {@link BatchQueue.add}
   */
  async produce(queueName: QueueName, data: T): Promise<void> {
    await this.batchQueue.add({ queueName, item: data })
  }
}
