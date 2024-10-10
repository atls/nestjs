import type { BatchQueue }                  from './batch-queue.js'
import type { OnChangeStateToOkCallback }   from './types/index.js'
import type { OnChangeStateToFailCallback } from './types/index.js'

export class StateHandler {
  constructor(private batchQueue: BatchQueue<any>) {}

  /**
   * Delegates to {@link BatchQueue.onChangeTotalStateToOk}
   */
  public onChangeTotalStateToOk(callback: OnChangeStateToOkCallback): void {
    this.batchQueue.onChangeTotalStateToOk(callback)
  }

  /**
   * Delegates to {@link BatchQueue.onChangeTotalStateToFail}
   */
  public onChangeTotalStateToFail(callback: OnChangeStateToFailCallback): void {
    this.batchQueue.onChangeTotalStateToFail(callback)
  }
}
