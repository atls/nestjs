import type { DynamicModule }                from '@nestjs/common'
import type { Provider }                     from '@nestjs/common'

import type { BatchQueueModuleAsyncOptions } from './batch-queue-module-options.interface.js'
import type { BatchQueueModuleOptions }      from './batch-queue-module-options.interface.js'
import type { BatchQueueOptionsFactory }     from './batch-queue-module-options.interface.js'

import { Module }                            from '@nestjs/common'
import { Inject }                            from '@nestjs/common'

import { BatchQueue }                        from '../batch-queue/index.js'
import { Consumer }                          from '../batch-queue/index.js'
import { BATCH_QUEUE_MODULE_OPTIONS }        from './batch-queue.constants.js'
import { BATCH_QUEUE_CONSUMER }              from './batch-queue.constants.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const BatchConsumer = () => Inject(BATCH_QUEUE_CONSUMER)

@Module({})
export class BatchQueueModule {
  static register(options: BatchQueueModuleOptions): DynamicModule {
    const batchQueue = new BatchQueue(options.core)

    const consumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useValue: new Consumer(batchQueue),
    }

    return {
      module: BatchQueueModule,
      providers: [consumerProvider],
      exports: [BATCH_QUEUE_CONSUMER],
    }
  }

  static registerAsync(options: BatchQueueModuleAsyncOptions): DynamicModule {
    return {
      module: BatchQueueModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
      exports: [BATCH_QUEUE_CONSUMER],
    }
  }

  private static createAsyncProviders(options: BatchQueueModuleAsyncOptions): Array<Provider> {
    const batchQueueConsumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useFactory: (opt: BatchQueueModuleOptions): Consumer => {
        const batchQueue = new BatchQueue(opt.core)
        return new Consumer(batchQueue)
      },
      inject: [BATCH_QUEUE_MODULE_OPTIONS],
    }

    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options), batchQueueConsumerProvider]
    }

    return [
      this.createAsyncOptionsProvider(options),
      batchQueueConsumerProvider,
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: BatchQueueModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: BATCH_QUEUE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: BATCH_QUEUE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: BatchQueueOptionsFactory) =>
        optionsFactory.createBatchQueueOptions(),
      inject: [options.useExisting! || options.useClass!],
    }
  }
}
