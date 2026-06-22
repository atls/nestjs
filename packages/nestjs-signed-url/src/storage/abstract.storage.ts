import type { SignedUrlReadOptions }  from './storage.interfaces.js'
import type { SignedUrlWriteOptions } from './storage.interfaces.js'
import type { SignedUrl }             from './storage.interfaces.js'

export abstract class AbstractStorage {
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
