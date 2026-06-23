import type { GcsSignedUrlReadOptions } from '../gcs/index.js'
import type { GcsSignedUrlSigning }     from '../gcs/index.js'
import type { SignedUrlOptions }        from '../interfaces.js'
import type { SignedUrlWriteOptions }   from '../interfaces.js'

import assert                           from 'node:assert/strict'
import { describe }                     from 'node:test'
import { it }                           from 'node:test'

describe('signed-url options', () => {
  it('exposes contentType without the legacy type option', () => {
    type HasContentType = 'contentType' extends keyof SignedUrlWriteOptions ? true : false
    type HasLegacyType = 'type' extends keyof SignedUrlWriteOptions ? true : false

    const hasContentType: HasContentType = true
    const hasLegacyType: HasLegacyType = false

    assert.equal(hasContentType, true)
    assert.equal(hasLegacyType, false)
  })

  it('keeps provider-specific option bags out of the common options', () => {
    type HasProviderOptions = 'providerOptions' extends keyof SignedUrlOptions ? true : false
    type HasGcsOptions = 'gcs' extends keyof GcsSignedUrlReadOptions ? true : false
    type GcsSignerReadOptions = NonNullable<Parameters<GcsSignedUrlSigning['generateReadUrl']>[2]>
    type GcsSignerHasGcsOptions = 'gcs' extends keyof GcsSignerReadOptions ? true : false
    type CommonHasGcsOptions = 'gcs' extends keyof SignedUrlOptions ? true : false

    const hasProviderOptions: HasProviderOptions = false
    const hasGcsOptions: HasGcsOptions = true
    const gcsSignerHasGcsOptions: GcsSignerHasGcsOptions = true
    const commonHasGcsOptions: CommonHasGcsOptions = false

    assert.equal(hasProviderOptions, false)
    assert.equal(hasGcsOptions, true)
    assert.equal(gcsSignerHasGcsOptions, true)
    assert.equal(commonHasGcsOptions, false)
  })
})
