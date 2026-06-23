import type { SignedUrlReadOptions }  from '../interfaces.js'
import type { SignedUrlWriteOptions } from '../interfaces.js'
import type { SignedUrlProvider }     from '../provider.js'

export interface WriteCall {
  bucket: string
  filename: string
  options: SignedUrlWriteOptions
}

export interface ReadCall {
  bucket: string
  filename: string
  options?: SignedUrlReadOptions
}

export type TestingSignedUrlProvider = SignedUrlProvider & {
  writeCalls: Array<WriteCall>
  readCalls: Array<ReadCall>
}
