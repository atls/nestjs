import type { BatchQueue }  from './batch-queue.js'
import type { ProcessorFn } from './types/index.js'

export class Consumer {
  constructor(private batchQueue: BatchQueue<any>) {}

  /**
   * Delegates to {@link BatchQueue.processBatch}
   */
  public consume<T>(processor: ProcessorFn<T>): void {
    this.batchQueue.processBatch(processor)
  }
}