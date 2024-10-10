import type { BatchQueue } from './batch-queue.js'
import type { CheckName }  from './types/index.js'
import type { Checks }     from './types/index.js'
import type { CheckOnAdd } from './types/index.js'

export class Checker {
  constructor(private batchQueue: BatchQueue<any>) {}

  /**
   * Delegates to {@link BatchQueue.createCheck}
   */
  public createCheck(checkName: CheckName, initialState: boolean): Checks {
    const checks = this.batchQueue.createCheck(checkName, initialState)
    return checks
  }

  /**
   * Delegates to {@link BatchQueue.createCheckOnAdd}
   */
  public createCheckOnAdd(
    checkName: CheckName,
    checkOnAdd: CheckOnAdd,
    checkEveryItem: number
  ): void {
    this.batchQueue.createCheckOnAdd(checkName, checkOnAdd, checkEveryItem)
  }
}
