import type { SignedUrlGateway }         from '../interfaces.js'
import type { GcsSignedUrlReadOptions }  from './interfaces.js'
import type { GcsSignedUrlSigning }      from './interfaces.js'
import type { GcsSignedUrlWriteOptions } from './interfaces.js'

import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'

import { SIGNED_URL_GATEWAY }            from '../constants.js'
import { SignedUrlSigner }               from '../signer.js'

@Injectable()
export class GcsSignedUrlSigner
  extends SignedUrlSigner<GcsSignedUrlReadOptions, GcsSignedUrlWriteOptions>
  implements GcsSignedUrlSigning
{
  constructor(
    @Inject(SIGNED_URL_GATEWAY)
    gateway: SignedUrlGateway<GcsSignedUrlReadOptions, GcsSignedUrlWriteOptions>
  ) {
    super(gateway)
  }
}
