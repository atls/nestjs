import type { SignUrlOptions } from '../storage/index.js'
import type { SignedUrl }      from '../storage/index.js'

import { Inject }              from '@nestjs/common'
import { Injectable }          from '@nestjs/common'

import { STORAGE }             from '../storage/index.js'

@Injectable()
export class SignedUrlService {
  @Inject(STORAGE)
  storage: any

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.storage.generateWriteUrl(bucket, filename, options) as Promise<SignedUrl>
  }

  async generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return this.storage.generateReadUrl(bucket, filename) as Promise<SignedUrl>
  }
}
