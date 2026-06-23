import type { Storage }       from '@google-cloud/storage'
import type { DynamicModule } from '@nestjs/common'

export const TESTING_GCS_STORAGE_FACTORY = Symbol('testing-gcs-storage-factory')

export type TestingGcsStorageFactory = {
  create: () => Storage
}

class TestingGcsClientModule {}

export const createTestingGcsClientModule = (storage: Storage): DynamicModule => ({
  module: TestingGcsClientModule,
  providers: [
    {
      provide: TESTING_GCS_STORAGE_FACTORY,
      useValue: {
        create: (): Storage => storage,
      },
    },
  ],
  exports: [TESTING_GCS_STORAGE_FACTORY],
})
