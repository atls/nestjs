import type { Storage }                  from '@google-cloud/storage'
import type { TestingModule }            from '@nestjs/testing'

import type { SignedUrlProvider }        from '../provider.js'
import type { TestingGcsStorageFactory } from '../../tests/fixtures/gcs.module.interfaces.js'

import assert                            from 'node:assert/strict'
import { afterEach }                     from 'node:test'
import { describe }                      from 'node:test'
import { it }                            from 'node:test'

import { Test }                          from '@nestjs/testing'

import { SIGNED_URL_PROVIDER }           from '../constants.js'
import { GcsSignedUrlSigner }            from '../gcs/index.js'
import { SignedUrlModule }               from '../module.js'
import { SignedUrlSigner }               from '../signer.js'
import { TESTING_GCS_STORAGE_FACTORY }   from '../../tests/fixtures/gcs.module.fixture.js'
import { createFakeGcsStorage }          from '../../tests/fixtures/gcs.client.fixture.js'
import { createTestingGcsClientModule }  from '../../tests/fixtures/gcs.module.fixture.js'

describe('SignedUrlModule', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('wires a value GCS client into the signed-url signer', async () => {
    const { client, storage } = createFakeGcsStorage('module-signed-url')

    moduleRef = await Test.createTestingModule({
      imports: [SignedUrlModule.gcs({ useValue: storage })],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)
    const gcsSigner = moduleRef.get(GcsSignedUrlSigner)
    const provider = moduleRef.get<SignedUrlProvider>(SIGNED_URL_PROVIDER)

    assert.equal(signer, gcsSigner)

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

    const readValue = await provider.generateReadUrl('bucket', 'file.png')

    assert.deepEqual(readValue, {
      url: 'module-signed-url',
      fields: [],
    })
  })

  it('wires an injected GCS client factory into the signed-url signer', async () => {
    const { client, storage } = createFakeGcsStorage('module-async-signed-url')

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.gcsAsync<[TestingGcsStorageFactory]>({
          imports: [createTestingGcsClientModule(storage)],
          inject: [TESTING_GCS_STORAGE_FACTORY],
          useFactory: (storageFactory: TestingGcsStorageFactory): Storage =>
            storageFactory.create(),
        }),
      ],
    }).compile()

    const signer = moduleRef.get(GcsSignedUrlSigner)

    const value = await signer.generateReadUrl('bucket', 'file.png', {
      expiresAt: 1730000000000,
      gcs: {
        queryParams: {
          source: 'module',
        },
        virtualHostedStyle: true,
      },
    })

    assert.deepEqual(value, {
      url: 'module-async-signed-url',
      fields: [],
    })
    assert.deepEqual(client.fileObject.params, {
      version: 'v4',
      queryParams: {
        source: 'module',
      },
      virtualHostedStyle: true,
      action: 'read',
      expires: 1730000000000,
    })
  })
})
