import type { DynamicModule }                from '@nestjs/common'
import type { Provider }                     from '@nestjs/common'

import type { BatchQueueModuleAsyncOptions } from './batch-queue-module-options.interface.js'
import type { BatchQueueModuleOptions }      from './batch-queue-module-options.interface.js'
import type { BatchQueueOptionsFactory }     from './batch-queue-module-options.interface.js'

import { Module }                            from '@nestjs/common'

import { BATCH_QUEUE_MODULE_OPTIONS }        from './batch-queue.constants.js'
import { createBatchQueueOptionsProvider }   from './batch-queue.providers.js'
import { createBatchQueueExportsProvider }   from './batch-queue.providers.js'

@Module({})
export class BatchQueueModule {
  static register(options: BatchQueueModuleOptions): DynamicModule {
    const optionsProviders = createBatchQueueOptionsProvider(options)
    const exportsProviders = createBatchQueueExportsProvider()

    // TODO: Create BatchQueue + inject to checkers + inject to producers + inject to consumers

    return {
      module: BatchQueueModule,
      providers: [...optionsProviders, ...exportsProviders],
      exports: exportsProviders,
    }
  }

  static registerAsync(options: BatchQueueModuleAsyncOptions): DynamicModule {
    const exportsProviders = createBatchQueueExportsProvider()

    // TODO: Create BatchQueue + inject to checkers + inject to producers + inject to consumers

    return {
      module: BatchQueueModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...exportsProviders],
      exports: exportsProviders,
    }
  }

  private static createAsyncProviders(options: BatchQueueModuleAsyncOptions): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    return [
      this.createAsyncOptionsProvider(options),
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
