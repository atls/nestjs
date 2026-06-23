import type { SignedUrlReadOptions }  from './options.js'
import type { SignedUrlWriteOptions } from './options.js'
import type { SignedUrl }             from './options.js'

export abstract class SignedUrlProvider {
  abstract generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignedUrlWriteOptions
  ): Promise<SignedUrl>

  abstract generateReadUrl(
    bucket: string,
    filename: string,
    options?: SignedUrlReadOptions
  ): Promise<SignedUrl>
}
