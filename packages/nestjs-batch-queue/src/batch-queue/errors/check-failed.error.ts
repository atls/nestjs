import type { CheckName } from '../batch-queue.interface.js'

import { BaseQueueError } from './base-queue.error.js'

export class CheckFailedError extends BaseQueueError {
  public failedChecks: Array<CheckName>

  constructor(failedChecks: Array<CheckName>) {
    super(`One or more checks failed: ${failedChecks.join(', ')}`)
    this.failedChecks = failedChecks
  }
}
