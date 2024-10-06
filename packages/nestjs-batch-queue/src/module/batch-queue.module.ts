import type { DynamicModule }                from '@nestjs/common'
import type { Provider }                     from '@nestjs/common'

import type { BatchQueueModuleAsyncOptions } from './batch-queue-module-options.interface.js'
import type { BatchQueueModuleOptions }      from './batch-queue-module-options.interface.js'
import type { BatchQueueOptionsFactory }     from './batch-queue-module-options.interface.js'

import { Module }                            from '@nestjs/common'
import { Inject }                            from '@nestjs/common'

import { BatchQueue }                        from '../batch-queue/index.js'
import { Consumer }                          from '../batch-queue/index.js'
import { Producer }                          from '../batch-queue/index.js'
import { Checker }                           from '../batch-queue/index.js'
import { BATCH_QUEUE_MODULE_OPTIONS }        from './batch-queue.constants.js'
import { BATCH_QUEUE_CONSUMER }              from './batch-queue.constants.js'
import { BATCH_QUEUE_PRODUCER }              from './batch-queue.constants.js'
import { BATCH_QUEUE_CHECKER }               from './batch-queue.constants.js'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const BatchConsumer = () => Inject(BATCH_QUEUE_CONSUMER)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const BatchProducer = () => Inject(BATCH_QUEUE_PRODUCER)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const BatchChecker = () => Inject(BATCH_QUEUE_CHECKER)

@Module({})
export class BatchQueueModule {
  static register(options: BatchQueueModuleOptions): DynamicModule {
    const batchQueue = new BatchQueue(options.core)

    const consumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useValue: new Consumer(batchQueue),
    }

    const producerProvider = {
      provide: BATCH_QUEUE_PRODUCER,
      useValue: new Producer(batchQueue),
    }

    const checkerProvider = {
      provide: BATCH_QUEUE_CHECKER,
      useValue: new Checker(batchQueue),
    }

    return {
      module: BatchQueueModule,
      providers: [consumerProvider, producerProvider, checkerProvider],
      exports: [BATCH_QUEUE_CONSUMER, BATCH_QUEUE_PRODUCER, BATCH_QUEUE_CHECKER],
    }
  }

  static registerAsync(options: BatchQueueModuleAsyncOptions): DynamicModule {
    return {
      module: BatchQueueModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
      exports: [BATCH_QUEUE_CONSUMER, BATCH_QUEUE_PRODUCER, BATCH_QUEUE_CHECKER],
    }
  }

  private static createAsyncProviders(options: BatchQueueModuleAsyncOptions): Array<Provider> {
    const batchQueueProvider = {
      provide: 'BATCH_QUEUE',
      useFactory: (opt: BatchQueueModuleOptions): BatchQueue<any> => new BatchQueue(opt.core),
      inject: [BATCH_QUEUE_MODULE_OPTIONS],
    }

    const consumerProvider = {
      provide: BATCH_QUEUE_CONSUMER,
      useFactory: (batchQueue: BatchQueue<any>): Consumer => new Consumer(batchQueue),
      inject: ['BATCH_QUEUE'],
    }

    const producerProvider = {
      provide: BATCH_QUEUE_PRODUCER,
      useFactory: (batchQueue: BatchQueue<any>): Producer<any> => new Producer(batchQueue),
      inject: ['BATCH_QUEUE'],
    }

    const checkerProvider = {
      provide: BATCH_QUEUE_CHECKER,
      useFactory: (batchQueue: BatchQueue<any>): Checker => new Checker(batchQueue),
      inject: ['BATCH_QUEUE'],
    }

    if (options.useExisting || options.useFactory) {
      return [
        this.createAsyncOptionsProvider(options),
        batchQueueProvider,
        consumerProvider,
        producerProvider,
        checkerProvider,
      ]
    }

    return [
      this.createAsyncOptionsProvider(options),
      batchQueueProvider,
      consumerProvider,
      producerProvider,
      checkerProvider,
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
