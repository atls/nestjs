import { SignUrlOptions } from './storage.interfaces'
import { SignedUrl }      from './storage.interfaces'

export abstract class AbstractStorage {
  abstract generateWriteUrl(
    bucket: string,
    filename: string,
    options: SignUrlOptions
  ): Promise<SignedUrl>

  abstract generateReadUrl(bucket: string, filename: string): Promise<SignedUrl>
}
