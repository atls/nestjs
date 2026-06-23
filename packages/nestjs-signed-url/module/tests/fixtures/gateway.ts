import type { SignedUrl }               from '../../../src/interfaces.js'
import type { SignedUrlGateway }        from '../../../src/interfaces.js'
import type { SignedUrlReadOptions }    from '../../../src/interfaces.js'
import type { SignedUrlWriteOptions }   from '../../../src/interfaces.js'
import type { TestingSignedUrlGateway } from '../../../tests/fixtures/signer.interfaces.js'

import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'

import { TESTING_SIGNED_URL_GATEWAY }   from './constants.js'

@Injectable()
export class TestingSignedUrlGatewayImpl implements SignedUrlGateway {
  constructor(
    @Inject(TESTING_SIGNED_URL_GATEWAY)
    private readonly gateway: TestingSignedUrlGateway
  ) {}

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignedUrlWriteOptions
  ): Promise<SignedUrl> {
    return this.gateway.generateWriteUrl(bucket, filename, options)
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options?: SignedUrlReadOptions
  ): Promise<SignedUrl> {
    return this.gateway.generateReadUrl(bucket, filename, options)
  }
}
