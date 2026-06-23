import type { SignedUrlReadOptions }    from '../../src/interfaces.js'
import type { SignedUrlWriteOptions }   from '../../src/interfaces.js'
import type { SignedUrl }               from '../../src/interfaces.js'
import type { ReadCall }                from './signer.interfaces.js'
import type { TestingSignedUrlGateway } from './signer.interfaces.js'
import type { WriteCall }               from './signer.interfaces.js'

export const createTestingSignedUrlGateway = (): TestingSignedUrlGateway => {
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
