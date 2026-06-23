import type { SignedUrlReadOptions }  from '../../src/interfaces.js'
import type { SignedUrlWriteOptions } from '../../src/interfaces.js'
import type { SignedUrlProvider }     from '../../src/provider.js'

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
