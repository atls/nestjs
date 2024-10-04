import type { ProcessorFn } from '../batch-queue/batch-queue.interface.js'
import type { BatchQueue }  from '../batch-queue/batch-queue.js'

export class Consumer {
  constructor(private batchQueue: BatchQueue<any>) {}

  public consume<T>(processor: ProcessorFn<T>): void {
    this.batchQueue.processBatch(processor)
  }
}
