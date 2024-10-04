import type { Provider }                from '@nestjs/common'

import type { BatchQueueModuleOptions } from './batch-queue-module-options.interface.js'

import { BATCH_QUEUE_MODULE_OPTIONS }   from './batch-queue.constants.js'

export const createBatchQueueOptionsProvider = (
  options: BatchQueueModuleOptions
): Array<Provider> => [
  {
    provide: BATCH_QUEUE_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createBatchQueueExportsProvider = (): Array<Provider> => []
