import type { TestingModule }   from '@nestjs/testing'

import assert                   from 'node:assert/strict'
import { afterEach }            from 'node:test'
import { describe }             from 'node:test'
import { it }                   from 'node:test'

import { Test }                 from '@nestjs/testing'

import { SignedUrlModule }      from '../module.js'
import { SignedUrlSigner }      from '../signer.js'
import { createFakeGcsStorage } from '../../tests/gcs.client.fixture.js'

describe('SignedUrlModule', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('wires the GCS client into the signed-url signer', async () => {
    const { client, storage } = createFakeGcsStorage('module-signed-url')

    moduleRef = await Test.createTestingModule({
      imports: [SignedUrlModule.gcs(storage)],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)

    const value = await signer.generateWriteUrl('bucket', 'file.png', {
      contentType: 'image/png',
      expiresAt: 1730000000000,
    })

    assert.deepEqual(value, {
      url: 'module-signed-url',
      fields: [],
    })
    assert.deepEqual(client.fileObject.params, {
      version: 'v4',
      action: 'write',
      expires: 1730000000000,
      contentType: 'image/png',
    })
  })
})
