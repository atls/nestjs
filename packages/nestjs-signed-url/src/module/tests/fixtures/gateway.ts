import type { DynamicModule }             from '@nestjs/common'

import type { TestingSignedUrlGateway }   from '../../../../tests/fixtures/signer.interfaces.js'
import type { SignedUrlGateway }          from '../../../interfaces.js'

import { Inject }                         from '@nestjs/common'
import { Injectable }                     from '@nestjs/common'

import { SIGNED_URL_GATEWAY }             from '../../../constants.js'
import { TESTING_SIGNED_URL_GATEWAY }     from './constants.js'
import { TestingSignedUrlGatewayModule }  from './gateway.module.js'
import { TestingSignedUrlOptionsFactory } from './options.js'

@Injectable()
export class TestingSignedUrlGatewayConsumer {
  constructor(
    @Inject(SIGNED_URL_GATEWAY)
    readonly gateway: SignedUrlGateway
  ) {}
}

export const createTestingSignedUrlGatewayModule = (
  gateway: TestingSignedUrlGateway
): DynamicModule => ({
  module: TestingSignedUrlGatewayModule,
  providers: [
    {
      provide: TESTING_SIGNED_URL_GATEWAY,
      useValue: gateway,
    },
    TestingSignedUrlOptionsFactory,
  ],
  exports: [TESTING_SIGNED_URL_GATEWAY, TestingSignedUrlOptionsFactory],
})
