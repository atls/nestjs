import type { DynamicModule }                   from '@nestjs/common'
import type { Provider }                        from '@nestjs/common'
import type { Type }                            from '@nestjs/common'

import type { BatchQueueModuleAsyncOptions }    from './batch-queue-module-options.interface.js'
import type { BatchQueueModuleOptions }         from './batch-queue-module-options.interface.js'
import type { BatchQueueOptionsFactory }        from './batch-queue-module-options.interface.js'

import { Module }                               from '@nestjs/common'

import { BATCH_QUEUE_MODULE_OPTIONS }           from '../constants/index.js'
import { createCheckManagerProvider }           from './batch-queue.providers.js'
import { createBatchQueueSyncProvider }         from './batch-queue.providers.js'
import { createBatchQueueAsyncProvider }        from './batch-queue.providers.js'
import { createBatchQueueConsumerProvider }     from './batch-queue.providers.js'
import { createBatchQueueProducerProvider }     from './batch-queue.providers.js'
import { createBatchQueueCheckerProvider }      from './batch-queue.providers.js'
import { createBatchQueueStateHandlerProvider } from './batch-queue.providers.js'
import { exportsProviders }                     from './batch-queue.providers.js'

@Module({})
export class BatchQueueModule {
  static register = (options: BatchQueueModuleOptions): DynamicModule => ({
    module: BatchQueueModule,
    providers: [
      createCheckManagerProvider(),
      createBatchQueueSyncProvider(options),
      createBatchQueueConsumerProvider(),
      createBatchQueueProducerProvider(),
      createBatchQueueCheckerProvider(),
      createBatchQueueStateHandlerProvider(),
    ],
    exports: exportsProviders,
  })

  static registerAsync(options: BatchQueueModuleAsyncOptions): DynamicModule {
    return {
      module: BatchQueueModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options)],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: BatchQueueModuleAsyncOptions): Array<Provider> {
    const providers: Array<Provider> = [
      createCheckManagerProvider(),
      this.createAsyncOptionsProvider(options),
      createBatchQueueAsyncProvider(),
      createBatchQueueConsumerProvider(),
      createBatchQueueProducerProvider(),
      createBatchQueueCheckerProvider(),
      createBatchQueueStateHandlerProvider(),
    ]
    if (!(options.useExisting || options.useFactory)) {
      if (!options.useClass) {
        throw new Error(
          'Invalid async options: expected useClass when no factory or existing provider is supplied'
        )
      }

      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      })
    }
    return providers
  }

  private static createAsyncOptionsProvider(options: BatchQueueModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: BATCH_QUEUE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const inject: Array<Type<BatchQueueOptionsFactory>> = []

    if (options.useExisting) {
      inject.push(options.useExisting)
    } else if (options.useClass) {
      inject.push(options.useClass)
    } else {
      throw new Error('Invalid async options: expected either useExisting or useClass provider')
    }

    return {
      provide: BATCH_QUEUE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: BatchQueueOptionsFactory) =>
        optionsFactory.createBatchQueueOptions(),
      inject,
    }
  }
}
