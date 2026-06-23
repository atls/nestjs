import type { SignedUrlReadOptions }  from '../options.js'
import type { SignedUrlWriteOptions } from '../options.js'
import type { SignedUrl }             from '../options.js'
import type { SignedUrlProvider }     from '../provider.js'

import assert                         from 'node:assert/strict'
import { describe }                   from 'node:test'
import { it }                         from 'node:test'

export interface SignedUrlProviderContractFixture {
  provider: SignedUrlProvider
  expectedWriteUrl: SignedUrl
  expectedReadUrl: SignedUrl
}

export const describeSignedUrlProviderContract = (
  subject: string,
  createFixture: () => SignedUrlProviderContractFixture
): void => {
  describe(`${subject} provider contract`, () => {
    it('generates write urls from the common write contract', async () => {
      const fixture = createFixture()
      const options: SignedUrlWriteOptions = {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-signed-url-origin': 'contract-test',
        },
        responseDisposition: 'inline',
      }

      const value = await fixture.provider.generateWriteUrl('bucket', 'file.png', options)

      assert.deepEqual(value, fixture.expectedWriteUrl)
    })

    it('generates read urls from the common read contract', async () => {
      const fixture = createFixture()
      const options: SignedUrlReadOptions = {
        expiresInSeconds: 30,
        responseDisposition: 'attachment; filename="file.png"',
      }

      const value = await fixture.provider.generateReadUrl('bucket', 'file.png', options)

      assert.deepEqual(value, fixture.expectedReadUrl)
    })
  })
}
