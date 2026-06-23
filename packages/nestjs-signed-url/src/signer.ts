import type { SignedUrlReadOptions }  from './interfaces.js'
import type { SignedUrlWriteOptions } from './interfaces.js'
import type { SignedUrl }             from './interfaces.js'
import type { SignedUrlProvider }     from './provider.js'

import { Inject }                     from '@nestjs/common'
import { Injectable }                 from '@nestjs/common'

import { SIGNED_URL_PROVIDER }        from './constants.js'

@Injectable()
export class SignedUrlSigner<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> {
  constructor(
    @Inject(SIGNED_URL_PROVIDER)
    private readonly provider: SignedUrlProvider<ReadOptions, WriteOptions>
  ) {}

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: WriteOptions
  ): Promise<SignedUrl> {
    return this.provider.generateWriteUrl(bucket, filename, options)
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options?: ReadOptions
  ): Promise<SignedUrl> {
    return this.provider.generateReadUrl(bucket, filename, options)
  }
}
