import type { SignedUrlReadOptions }  from './interfaces.js'
import type { SignedUrlWriteOptions } from './interfaces.js'
import type { SignedUrl }             from './interfaces.js'

export abstract class SignedUrlProvider<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> {
  abstract generateWriteUrl(
    bucket: string,
    filename: string,
    options: WriteOptions
  ): Promise<SignedUrl>

  abstract generateReadUrl(
    bucket: string,
    filename: string,
    options?: ReadOptions
  ): Promise<SignedUrl>
}
