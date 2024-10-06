import type { CheckName }  from './batch-queue.interface.js'
import type { Checks }     from './batch-queue.interface.js'
import type { BatchQueue } from './batch-queue.js'

export class Checker {
  constructor(private batchQueue: BatchQueue<any>) {}

  public createCheck(checkName: CheckName, initialState: boolean): Checks {
    const checks = this.batchQueue.createCheck(checkName, initialState)
    return checks
  }
}
