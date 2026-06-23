import type { SignedUrlReadOptions }  from './options.js'
import type { SignedUrlWriteOptions } from './options.js'
import type { SignedUrl }             from './options.js'

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
