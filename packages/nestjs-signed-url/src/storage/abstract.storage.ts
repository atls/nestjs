import type { SignUrlOptions } from './storage.interfaces.js'
import type { SignedUrl }      from './storage.interfaces.js'

export abstract class AbstractStorage {
  abstract generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl>

  abstract generateReadUrl(bucket: string, filename: string): Promise<SignedUrl>
}
