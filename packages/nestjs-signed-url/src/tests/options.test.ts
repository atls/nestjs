import type { GcsSignedUrlReadOptions }  from '../gcs/index.js'
import type { GcsSignedUrlSigning }      from '../gcs/index.js'
import type { SignedUrlOptions }         from '../interfaces.js'
import type { SignedUrlWriteOptions }    from '../interfaces.js'
import type { S3SignedUrlModuleOptions } from '../module/index.js'
import type { S3SignedUrlSigning }       from '../s3/index.js'

import assert                            from 'node:assert/strict'
import { describe }                      from 'node:test'
import { it }                            from 'node:test'

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
    type S3SignerReadOptions = NonNullable<Parameters<S3SignedUrlSigning['generateReadUrl']>[2]>
    type S3SignerWriteOptions = Parameters<S3SignedUrlSigning['generateWriteUrl']>[2]
    type S3SignerHasS3Options = 's3' extends keyof S3SignerReadOptions ? true : false
    type S3SignerReadHasHeaders = 'headers' extends keyof S3SignerReadOptions ? true : false
    type S3SignerWriteHasHeaders = 'headers' extends keyof S3SignerWriteOptions ? true : false
    type CommonHasGcsOptions = 'gcs' extends keyof SignedUrlOptions ? true : false
    type CommonHasS3Options = 's3' extends keyof SignedUrlOptions ? true : false

    const hasProviderOptions: HasProviderOptions = false
    const hasGcsOptions: HasGcsOptions = true
    const gcsSignerHasGcsOptions: GcsSignerHasGcsOptions = true
    const s3SignerHasS3Options: S3SignerHasS3Options = true
    const s3SignerReadHasHeaders: S3SignerReadHasHeaders = false
    const s3SignerWriteHasHeaders: S3SignerWriteHasHeaders = false
    const commonHasGcsOptions: CommonHasGcsOptions = false
    const commonHasS3Options: CommonHasS3Options = false

    assert.equal(hasProviderOptions, false)
    assert.equal(hasGcsOptions, true)
    assert.equal(gcsSignerHasGcsOptions, true)
    assert.equal(s3SignerHasS3Options, true)
    assert.equal(s3SignerReadHasHeaders, false)
    assert.equal(s3SignerWriteHasHeaders, false)
    assert.equal(commonHasGcsOptions, false)
    assert.equal(commonHasS3Options, false)
  })

  it('keeps S3 client configuration out of the signed-url module options', () => {
    type HasRegion = 'region' extends keyof S3SignedUrlModuleOptions ? true : false
    type HasEndpoint = 'endpoint' extends keyof S3SignedUrlModuleOptions ? true : false
    type HasCredentials = 'credentials' extends keyof S3SignedUrlModuleOptions ? true : false
    type HasForcePathStyle = 'forcePathStyle' extends keyof S3SignedUrlModuleOptions ? true : false

    const hasRegion: HasRegion = false
    const hasEndpoint: HasEndpoint = false
    const hasCredentials: HasCredentials = false
    const hasForcePathStyle: HasForcePathStyle = false

    assert.equal(hasRegion, false)
    assert.equal(hasEndpoint, false)
    assert.equal(hasCredentials, false)
    assert.equal(hasForcePathStyle, false)
  })
})
