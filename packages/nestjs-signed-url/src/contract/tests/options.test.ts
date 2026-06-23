import type { SignedUrlOptions }      from '../options.js'
import type { SignedUrlWriteOptions } from '../options.js'

import assert                         from 'node:assert/strict'
import { describe }                   from 'node:test'
import { it }                         from 'node:test'

describe('signed-url options', () => {
  it('exposes contentType without the legacy type option', () => {
    type HasContentType = 'contentType' extends keyof SignedUrlWriteOptions ? true : false
    type HasLegacyType = 'type' extends keyof SignedUrlWriteOptions ? true : false

    const hasContentType: HasContentType = true
    const hasLegacyType: HasLegacyType = false

    assert.equal(hasContentType, true)
    assert.equal(hasLegacyType, false)
  })

  it('keeps provider-specific option bags out of the common contract', () => {
    type HasProviderOptions = 'providerOptions' extends keyof SignedUrlOptions ? true : false

    const hasProviderOptions: HasProviderOptions = false

    assert.equal(hasProviderOptions, false)
  })
})
