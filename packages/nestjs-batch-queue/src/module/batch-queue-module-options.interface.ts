import type { Type }              from '@nestjs/common'
import type { ModuleMetadata }    from '@nestjs/common'

import type { BatchQueueOptions } from '../batch-queue/index.js'
import type { Consumer }          from '../proxy-clases/index.js'

export interface BatchQueueModuleOptions {
  core: BatchQueueOptions
}

export interface BatchQueueOptionsFactory {
  createBatchQueueOptions: () => BatchQueueModuleOptions | Promise<BatchQueueModuleOptions>
}

export interface BatchQueueConsumerFactory {
  createBatchQueueConsumer: () => Consumer | Promise<Consumer>
}

export interface BatchQueueModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<BatchQueueOptionsFactory>
  useClass?: Type<BatchQueueOptionsFactory>
  useFactory?: (...args: Array<any>) => BatchQueueModuleOptions | Promise<BatchQueueModuleOptions>
  inject?: Array<any>
}
