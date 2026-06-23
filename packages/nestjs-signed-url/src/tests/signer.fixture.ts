import type { SignedUrlReadOptions }  from '../options.js'
import type { SignedUrlWriteOptions } from '../options.js'
import type { SignedUrl }             from '../options.js'
import type { SignedUrlProvider }     from '../provider.js'

export type WriteCall = {
  bucket: string
  filename: string
  options: SignedUrlWriteOptions
}

export type ReadCall = {
  bucket: string
  filename: string
  options?: SignedUrlReadOptions
}

export type TestingSignedUrlProvider = SignedUrlProvider & {
  writeCalls: Array<WriteCall>
  readCalls: Array<ReadCall>
}

export const createTestingSignedUrlProvider = (): TestingSignedUrlProvider => {
  const writeCalls: Array<WriteCall> = []
  const readCalls: Array<ReadCall> = []

  return {
    writeCalls,
    readCalls,

    async generateWriteUrl(
      bucket: string,
      filename: string,
      options: SignedUrlWriteOptions
    ): Promise<SignedUrl> {
      writeCalls.push({
        bucket,
        filename,
        options,
      })

      return {
        url: 'write-url',
        fields: [],
      }
    },

    async generateReadUrl(
      bucket: string,
      filename: string,
      options?: SignedUrlReadOptions
    ): Promise<SignedUrl> {
      readCalls.push({
        bucket,
        filename,
        options,
      })

      return {
        url: 'read-url',
        fields: [],
      }
    },
  }
}
