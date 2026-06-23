import type { Storage }       from '@google-cloud/storage'
import type { DynamicModule } from '@nestjs/common'
import type { TestingGcsStorageFactory } from './gcs.module.interfaces.js'

class TestingGcsClientModule {}

export const TESTING_GCS_STORAGE_FACTORY = Symbol('testing-gcs-storage-factory')

export const createTestingGcsClientModule = (storage: Storage): DynamicModule => {
  const storageFactory: TestingGcsStorageFactory = {
    create: (): Storage => storage,
  }

  return {
    module: TestingGcsClientModule,
    providers: [
      {
        provide: TESTING_GCS_STORAGE_FACTORY,
        useValue: storageFactory,
      },
    ],
    exports: [TESTING_GCS_STORAGE_FACTORY],
  }
}
