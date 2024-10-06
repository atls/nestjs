import type { OnChangeStateToOkCallback }   from './batch-queue.interface.js'
import type { OnChangeStateToFailCallback } from './batch-queue.interface.js'
import type { BatchQueue }                  from './batch-queue.js'

export class StateHandler {
  constructor(private batchQueue: BatchQueue<any>) {}

  public onChangeTotalStateToOk(callback: OnChangeStateToOkCallback): void {
    this.batchQueue.onChangeTotalStateToOk(callback)
  }

  public onChangeTotalStateToFail(callback: OnChangeStateToFailCallback): void {
    this.batchQueue.onChangeTotalStateToFail(callback)
  }
}
