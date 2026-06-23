import type { SignedUrlReadOptions }  from './options.js'
import type { SignedUrlWriteOptions } from './options.js'
import type { SignedUrl }             from './options.js'
import type { SignedUrlProvider }     from './provider.js'

import { Inject }                     from '@nestjs/common'
import { Injectable }                 from '@nestjs/common'

import { SIGNED_URL_PROVIDER }        from './constants.js'

@Injectable()
export class SignedUrlSigner {
  constructor(@Inject(SIGNED_URL_PROVIDER) private readonly provider: SignedUrlProvider) {}

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignedUrlWriteOptions
  ): Promise<SignedUrl> {
    return this.provider.generateWriteUrl(bucket, filename, options)
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options: SignedUrlReadOptions = {}
  ): Promise<SignedUrl> {
    return this.provider.generateReadUrl(bucket, filename, options)
  }
}
