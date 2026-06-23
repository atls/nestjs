import type { SignedUrlGateway } from '../../../src/interfaces.js'

import { Inject }                from '@nestjs/common'
import { Injectable }            from '@nestjs/common'

import { SIGNED_URL_GATEWAY }    from '../../../src/constants.js'

@Injectable()
export class TestingSignedUrlGatewayConsumer {
  constructor(
    @Inject(SIGNED_URL_GATEWAY)
    readonly gateway: SignedUrlGateway
  ) {}
}
