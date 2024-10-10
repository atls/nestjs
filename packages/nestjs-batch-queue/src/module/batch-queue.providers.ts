import type { Provider }                from '@nestjs/common'

import type { BatchQueueModuleOptions } from './batch-queue-module-options.interface.js'

import { BatchQueue }                   from '../batch-queue/index.js'
import { Consumer }                     from '../batch-queue/index.js'
import { Producer }                     from '../batch-queue/index.js'
import { Checker }                      from '../batch-queue/index.js'
import { StateHandler }                 from '../batch-queue/index.js'
import { CheckManager }                 from '../check-manager/index.js'
import { BATCH_QUEUE_MODULE_OPTIONS }   from '../constants/index.js'
import { BATCH_QUEUE }                  from '../constants/index.js'
import { BATCH_QUEUE_CHECK_MANAGER }    from '../constants/index.js'
import { BATCH_QUEUE_CONSUMER }         from '../constants/index.js'
import { BATCH_QUEUE_PRODUCER }         from '../constants/index.js'
import { BATCH_QUEUE_CHECKER }          from '../constants/index.js'
import { BATCH_QUEUE_STATE_HANDLER }    from '../constants/index.js'

export const createCheckManagerProvider = (): Provider => ({
  provide: BATCH_QUEUE_CHECK_MANAGER,
  useValue: new CheckManager(),
})

export const createBatchQueueSyncProvider = (
  batchQueueModuleOptions: BatchQueueModuleOptions
): Provider => ({
  provide: BATCH_QUEUE,
  useFactory: (checkManager: CheckManager): BatchQueue<any> =>
    new BatchQueue(batchQueueModuleOptions.core, checkManager),
  inject: [BATCH_QUEUE_CHECK_MANAGER],
})

export const createBatchQueueAsyncProvider = (): Provider => ({
  provide: BATCH_QUEUE,
  useFactory: (
    batchQueueModuleOptions: BatchQueueModuleOptions,
    checkManager: CheckManager
  ): BatchQueue<any> => new BatchQueue(batchQueueModuleOptions.core, checkManager),
  inject: [BATCH_QUEUE_MODULE_OPTIONS, BATCH_QUEUE_CHECK_MANAGER],
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
  useFactory: (checkManager: CheckManager): Checker => new Checker(checkManager),
  inject: [BATCH_QUEUE_CHECK_MANAGER],
})

export const createBatchQueueStateHandlerProvider = (): Provider => ({
  provide: BATCH_QUEUE_STATE_HANDLER,
  useFactory: (checkManager: CheckManager): StateHandler => new StateHandler(checkManager),
  inject: [BATCH_QUEUE_CHECK_MANAGER],
})

export const exportsProviders = [
  BATCH_QUEUE_CONSUMER,
  BATCH_QUEUE_PRODUCER,
  BATCH_QUEUE_CHECKER,
  BATCH_QUEUE_STATE_HANDLER,
]
