import type { SignUrlOptions }  from '../storage/index.js'
import type { SignedUrl }       from '../storage/index.js'
 
import type { AbstractStorage } from '../storage/index.js'

import { Inject }               from '@nestjs/common'
import { Injectable }           from '@nestjs/common'

import { STORAGE }              from '../storage/index.js'

@Injectable()
export class SignedUrlService {
  @Inject(STORAGE)
  storage: AbstractStorage

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl> {
    return this.storage.generateWriteUrl(bucket, filename, options)
  }

  async generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    return this.storage.generateReadUrl(bucket, filename)
  }
}
