import type { SignedUrlReadOptions }  from '../options.js'
import type { SignedUrlWriteOptions } from '../options.js'
import type { SignedUrl }             from '../options.js'
import type { SignedUrlProvider }     from '../provider.js'

import assert                         from 'node:assert/strict'
import { beforeEach }                 from 'node:test'
import { describe }                   from 'node:test'
import { it }                         from 'node:test'

import { SignedUrlSigner }            from '../signer.js'

interface WriteCall {
  bucket: string
  filename: string
  options: SignedUrlWriteOptions
}

interface ReadCall {
  bucket: string
  filename: string
  options: SignedUrlReadOptions
}

type TestingProvider = SignedUrlProvider & {
  writeCalls: Array<WriteCall>
  readCalls: Array<ReadCall>
}

const createTestingProvider = (): TestingProvider => {
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
      options: SignedUrlReadOptions = {}
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

describe('SignedUrlSigner', () => {
  let signer: SignedUrlSigner
  let provider: TestingProvider

  beforeEach(() => {
    provider = createTestingProvider()
    signer = new SignedUrlSigner(provider)
  })

  describe('generateWriteUrl', () => {
    it('delegates bucket, filename, and write options to the provider', async () => {
      const options: SignedUrlWriteOptions = {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-goog-meta-origin': 'test',
        },
        responseDisposition: 'inline',
      }

      const value = await signer.generateWriteUrl('bucket', 'file.png', options)

      assert.deepEqual(value, {
        url: 'write-url',
        fields: [],
      })
      assert.deepEqual(provider.writeCalls, [
        {
          bucket: 'bucket',
          filename: 'file.png',
          options,
        },
      ])
    })
  })

  describe('generateReadUrl', () => {
    it('delegates bucket, filename, and read options to the provider', async () => {
      const options: SignedUrlReadOptions = {
        expiresInSeconds: 30,
        responseDisposition: 'attachment; filename="file.png"',
      }

      const value = await signer.generateReadUrl('bucket', 'file.png', options)

      assert.deepEqual(value, {
        url: 'read-url',
        fields: [],
      })
      assert.deepEqual(provider.readCalls, [
        {
          bucket: 'bucket',
          filename: 'file.png',
          options,
        },
      ])
    })
  })
})
