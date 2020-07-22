import { Injectable }                from '@nestjs/common'

import { SignUrlOptions, SignedUrl } from '../storage'

@Injectable()
export class SignedUrlService {
  storage: any

  generateWriteUrl(bucket: string, filename: string, options: SignUrlOptions): Promise<SignedUrl> {
    return this.storage.generateWriteUrl(bucket, filename, options)
  }

  generateReadUrl(bucket: string, filename: string): Promise<SignedUrl> {
    return this.storage.generateReadUrl(bucket, filename)
  }
}
