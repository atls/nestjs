/* eslint-disable max-classes-per-file */
export class BaseQueueError extends Error {}

export class CheckFailedError extends BaseQueueError {}

export class MaxQueueCountError extends BaseQueueError {}

export class MaxQueueLengthExceededError extends BaseQueueError {}

export class MaxTotalLengthOfQueuesExceededError extends BaseQueueError {}
