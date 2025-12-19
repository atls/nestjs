import type { BatchQueue }  from '../batch-queue/index.js'
import type { ProcessorFn } from '../batch-queue/index.js'

export class Consumer {
  constructor(private batchQueue: BatchQueue<unknown>) {}

  /**
   * Delegates to {@link BatchQueue.processBatch}
   */
  public consume<T>(processor: ProcessorFn<T>): void {
    this.batchQueue.processBatch(processor)
  }
}
