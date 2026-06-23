import type { SignedUrlGateway }      from '../../src/interfaces.js'
import type { SignedUrlReadOptions }  from '../../src/interfaces.js'
import type { SignedUrlWriteOptions } from '../../src/interfaces.js'

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

export type TestingSignedUrlGateway = SignedUrlGateway & {
  writeCalls: Array<WriteCall>
  readCalls: Array<ReadCall>
}
