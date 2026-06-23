import type { SignedUrlReadOptions }      from '../interfaces.js'
import type { SignedUrlWriteOptions }     from '../interfaces.js'
import type { TestingSignedUrlProvider }  from './signer.interfaces.js'

import assert                             from 'node:assert/strict'
import { beforeEach }                     from 'node:test'
import { describe }                       from 'node:test'
import { it }                             from 'node:test'

import { SignedUrlSigner }                from '../signer.js'
import { createTestingSignedUrlProvider } from './signer.fixture.js'

describe('SignedUrlSigner', () => {
  let signer: SignedUrlSigner
  let provider: TestingSignedUrlProvider

  beforeEach(() => {
    provider = createTestingSignedUrlProvider()
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
