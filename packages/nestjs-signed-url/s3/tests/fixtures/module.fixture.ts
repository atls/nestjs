import type { S3Client }               from '@atls/nestjs-s3-client'
import type { DynamicModule }          from '@nestjs/common'

import type { TestingS3ClientFactory } from './module.interfaces.js'

class TestingS3ClientModule {}

export const TESTING_S3_CLIENT_FACTORY = Symbol('testing-s3-client-factory')

export const createTestingS3ClientModule = (client: S3Client): DynamicModule => {
  const clientFactory: TestingS3ClientFactory = {
    create: (): S3Client => client,
  }

  return {
    module: TestingS3ClientModule,
    providers: [
      {
        provide: TESTING_S3_CLIENT_FACTORY,
        useValue: clientFactory,
      },
    ],
    exports: [TESTING_S3_CLIENT_FACTORY],
  }
}
