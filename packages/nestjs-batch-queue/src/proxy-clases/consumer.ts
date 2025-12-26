import type { BatchQueue }  from '../batch-queue/index.js'
import type { ProcessorFn } from '../batch-queue/index.js'

export class Consumer<T = unknown> {
  constructor(private batchQueue: BatchQueue<T>) {}

  /**
   * Delegates to {@link BatchQueue.processBatch}
   */
  public consume(processor: ProcessorFn<T>): void {
    this.batchQueue.processBatch(processor)
  }
}
