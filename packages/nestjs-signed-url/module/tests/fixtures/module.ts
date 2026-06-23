import type { DynamicModule }           from '@nestjs/common'

import type { TestingSignedUrlGateway } from '../../../tests/fixtures/signer.interfaces.js'

import { TESTING_SIGNED_URL_GATEWAY }   from './constants.js'
import { TestingSignedUrlGatewayImpl }  from './gateway.js'

class TestingSignedUrlGatewayModule {}

export const createTestingSignedUrlGatewayModule = (
  gateway: TestingSignedUrlGateway
): DynamicModule => ({
  module: TestingSignedUrlGatewayModule,
  providers: [
    {
      provide: TESTING_SIGNED_URL_GATEWAY,
      useValue: gateway,
    },
    TestingSignedUrlGatewayImpl,
  ],
  exports: [TESTING_SIGNED_URL_GATEWAY, TestingSignedUrlGatewayImpl],
})
