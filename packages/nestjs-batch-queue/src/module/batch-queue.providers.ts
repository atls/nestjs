import type { Provider }                from '@nestjs/common'

import type { BatchQueueModuleOptions } from './batch-queue-module-options.interface.js'

import { BatchQueue }                   from '../batch-queue/index.js'
import { Consumer }                     from '../batch-queue/index.js'
import { Producer }                     from '../batch-queue/index.js'
import { Checker }                      from '../batch-queue/index.js'
import { StateHandler }                 from '../batch-queue/index.js'
import { BATCH_QUEUE_MODULE_OPTIONS }   from './constants/index.js'
import { BATCH_QUEUE }                  from './constants/index.js'
import { BATCH_QUEUE_CONSUMER }         from './constants/index.js'
import { BATCH_QUEUE_PRODUCER }         from './constants/index.js'
import { BATCH_QUEUE_CHECKER }          from './constants/index.js'
import { BATCH_QUEUE_STATE_HANDLER }    from './constants/index.js'

export const createBatchQueueSyncProvider = (
  batchQueueModuleOptions: BatchQueueModuleOptions
): Provider => ({
  provide: BATCH_QUEUE,
  useValue: new BatchQueue(batchQueueModuleOptions.core),
})

export const createBatchQueueAsyncProvider = (): Provider => ({
  provide: BATCH_QUEUE,
  useFactory: (batchQueueModuleOptions: BatchQueueModuleOptions): BatchQueue<any> =>
    new BatchQueue(batchQueueModuleOptions.core),
  inject: [BATCH_QUEUE_MODULE_OPTIONS],
})

export const createBatchQueueConsumerProvider = (): Provider => ({
  provide: BATCH_QUEUE_CONSUMER,
  useFactory: (batchQueue: BatchQueue<any>): Consumer => new Consumer(batchQueue),
  inject: [BATCH_QUEUE],
})

export const createBatchQueueProducerProvider = (): Provider => ({
  provide: BATCH_QUEUE_PRODUCER,
  useFactory: (batchQueue: BatchQueue<any>): Producer<any> => new Producer(batchQueue),
  inject: [BATCH_QUEUE],
})

export const createBatchQueueCheckerProvider = (): Provider => ({
  provide: BATCH_QUEUE_CHECKER,
  useFactory: (batchQueue: BatchQueue<any>): Checker => new Checker(batchQueue),
  inject: [BATCH_QUEUE],
})

export const createBatchQueueStateHandlerProvider = (): Provider => ({
  provide: BATCH_QUEUE_STATE_HANDLER,
  useFactory: (batchQueue: BatchQueue<any>): StateHandler => new StateHandler(batchQueue),
  inject: [BATCH_QUEUE],
})

export const exportsProviders = [
  BATCH_QUEUE_CONSUMER,
  BATCH_QUEUE_PRODUCER,
  BATCH_QUEUE_CHECKER,
  BATCH_QUEUE_STATE_HANDLER,
]
