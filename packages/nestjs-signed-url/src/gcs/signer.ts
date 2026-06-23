import type { SignedUrlProvider }        from '../provider.js'
import type { GcsSignedUrlReadOptions }  from './interfaces.js'
import type { GcsSignedUrlWriteOptions } from './interfaces.js'

import { Inject }                        from '@nestjs/common'
import { Injectable }                    from '@nestjs/common'

import { SIGNED_URL_PROVIDER }           from '../constants.js'
import { SignedUrlSigner }               from '../signer.js'

@Injectable()
export class GcsSignedUrlSigner extends SignedUrlSigner<
  GcsSignedUrlReadOptions,
  GcsSignedUrlWriteOptions
> {
  constructor(
    @Inject(SIGNED_URL_PROVIDER)
    provider: SignedUrlProvider<GcsSignedUrlReadOptions, GcsSignedUrlWriteOptions>
  ) {
    super(provider)
  }
}
