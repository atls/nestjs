import type { DynamicModule }                from '@nestjs/common'
import type { Provider }                     from '@nestjs/common'

import type { BatchQueueModuleAsyncOptions } from './batch-queue-module-options.interface.js'
import type { BatchQueueModuleOptions }      from './batch-queue-module-options.interface.js'
import type { BatchQueueOptionsFactory }     from './batch-queue-module-options.interface.js'

import { Module }                            from '@nestjs/common'

import { BatchQueue }                        from '../batch-queue/index.js'
import { Consumer }                          from '../batch-queue/index.js'
import { Producer }                          from '../batch-queue/index.js'
import { Checker }                           from '../batch-queue/index.js'
import { StateHandler }                      from '../batch-queue/index.js'
import { BATCH_QUEUE }                       from './constants/index.js'
import { BATCH_QUEUE_MODULE_OPTIONS }        from './constants/index.js'
import { BATCH_QUEUE_CONSUMER }              from './constants/index.js'
import { BATCH_QUEUE_PRODUCER }              from './constants/index.js'
import { BATCH_QUEUE_CHECKER }               from './constants/index.js'
import { BATCH_QUEUE_STATE_HANDLER }         from './constants/index.js'
import { MEMORY_CHECKER_OPTIONS }            from './constants/index.js'

@Module({})
export class BatchQueueModule {
  static register(options: BatchQueueModuleOptions): DynamicModule {
    const batchQueueProvider = {
      provide: BATCH_QUEUE,
      useValue: new BatchQueue(options.core),
    }

    const memoryCheckerOptionsProvider = {
      provide: MEMORY_CHECKER_OPTIONS,
      useValue: options.memoryCheckerOptions,
    }

    const consumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useFactory: (batchQueue: BatchQueue<any>): Consumer => new Consumer(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const producerProvider = {
      provide: BATCH_QUEUE_PRODUCER,
      useFactory: (batchQueue: BatchQueue<any>): Producer<any> => new Producer(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const checkerProvider = {
      provide: BATCH_QUEUE_CHECKER,
      useFactory: (batchQueue: BatchQueue<any>): Checker => new Checker(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const stateHandlerProvider = {
      provide: BATCH_QUEUE_STATE_HANDLER,
      useFactory: (batchQueue: BatchQueue<any>): StateHandler => new StateHandler(batchQueue),
      inject: [BATCH_QUEUE],
    }

    return {
      module: BatchQueueModule,
      providers: [
        batchQueueProvider,
        consumerProvider,
        producerProvider,
        checkerProvider,
        stateHandlerProvider,
        memoryCheckerOptionsProvider,
      ],
      exports: [
        BATCH_QUEUE_CONSUMER,
        BATCH_QUEUE_PRODUCER,
        BATCH_QUEUE_CHECKER,
        BATCH_QUEUE_STATE_HANDLER,
        MEMORY_CHECKER_OPTIONS,
      ],
    }
  }

  static registerAsync(options: BatchQueueModuleAsyncOptions): DynamicModule {
    return {
      module: BatchQueueModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
      exports: [
        BATCH_QUEUE_CONSUMER,
        BATCH_QUEUE_PRODUCER,
        BATCH_QUEUE_CHECKER,
        BATCH_QUEUE_STATE_HANDLER,
        MEMORY_CHECKER_OPTIONS,
      ],
    }
  }

  private static createAsyncProviders(options: BatchQueueModuleAsyncOptions): Array<Provider> {
    const batchQueueProvider = {
      provide: BATCH_QUEUE,
      useFactory: (opt: BatchQueueModuleOptions): BatchQueue<any> => new BatchQueue(opt.core),
      inject: [BATCH_QUEUE_MODULE_OPTIONS],
    }

    const memoryCheckerOptionsProvider = {
      provide: MEMORY_CHECKER_OPTIONS,
      useFactory: (opt: BatchQueueModuleOptions) => opt.memoryCheckerOptions,
      inject: [BATCH_QUEUE_MODULE_OPTIONS],
    }

    const consumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useFactory: (batchQueue: BatchQueue<any>): Consumer => new Consumer(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const producerProvider = {
      provide: BATCH_QUEUE_PRODUCER,
      useFactory: (batchQueue: BatchQueue<any>): Producer<any> => new Producer(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const checkerProvider = {
      provide: BATCH_QUEUE_CHECKER,
      useFactory: (batchQueue: BatchQueue<any>): Checker => new Checker(batchQueue),
      inject: [BATCH_QUEUE],
    }

    const stateHandlerProvider = {
      provide: BATCH_QUEUE_STATE_HANDLER,
      useFactory: (batchQueue: BatchQueue<any>): StateHandler => new StateHandler(batchQueue),
      inject: [BATCH_QUEUE],
    }

    if (options.useExisting || options.useFactory) {
      return [
        this.createAsyncOptionsProvider(options),
        batchQueueProvider,
        consumerProvider,
        producerProvider,
        checkerProvider,
        stateHandlerProvider,
        memoryCheckerOptionsProvider,
      ]
    }

    return [
      this.createAsyncOptionsProvider(options),
      batchQueueProvider,
      consumerProvider,
      producerProvider,
      checkerProvider,
      stateHandlerProvider,
      memoryCheckerOptionsProvider,
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
