import { BatchQueueOptions } from '../batch-queue/index.js'
import { MemoryCheckerOptions } from '../checkers/memory-checker/index.js'

export interface BatchQueueModuleOptions {
  core: BatchQueueOptions
  memoryCheckerOptions?: MemoryCheckerOptions
}

export interface BatchQueueOptionsFactory {
  createBatchQueueOptions: () =>
    | BatchQueueModuleOptions
    | Promise<BatchQueueModuleOptions>
}

export interface BatchQueueModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<BatchQueueOptionsFactory>
  useClass?: Type<BatchQueueOptionsFactory>
  useFactory?: (
    ...args: Array<any>
  ) => BatchQueueModuleOptions | Promise<BatchQueueModuleOptions>
  inject?: Array<any>
}
