/* eslint-disable max-classes-per-file */
import type { CheckName } from '../batch-queue/batch-queue.interface.js'

export class BaseQueueError extends Error {}

export class CheckFailedError extends BaseQueueError {
  public failedChecks: Array<CheckName>

  constructor(failedChecks: Array<CheckName>) {
    super(`One or more checks failed: ${failedChecks.join(', ')}`)
    this.failedChecks = failedChecks
  }
}

export class MaxQueueCountError extends BaseQueueError {}

export class MaxQueueLengthExceededError extends BaseQueueError {}

export class MaxTotalLengthOfQueuesExceededError extends BaseQueueError {}
