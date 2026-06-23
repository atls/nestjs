import type { Storage }                  from '@google-cloud/storage'
import type { TestingModule }            from '@nestjs/testing'

import type { SignedUrlGateway }         from '../../src/interfaces.js'
import type { TestingGcsStorageFactory } from './fixtures/module.interfaces.js'

import assert                            from 'node:assert/strict'
import { afterEach }                     from 'node:test'
import { describe }                      from 'node:test'
import { it }                            from 'node:test'

import { Inject }                        from '@nestjs/common'
import { Test }                          from '@nestjs/testing'

import { GcsClientFactory }              from '@atls/nestjs-gcs-client'
import { GcsClientModule }               from '@atls/nestjs-gcs-client'

import { SIGNED_URL_GATEWAY }            from '../../src/constants.js'
import { GCS_SIGNED_URL_CLIENT }         from '../../src/gcs/index.js'
import { GcsSignedUrlSigner }            from '../../src/gcs/signer.js'
import { SignedUrlModule }               from '../../src/module/index.js'
import { SignedUrlSigner }               from '../../src/signer.js'
import { TESTING_GCS_STORAGE_FACTORY }   from './fixtures/module.fixture.js'
import { createFakeGcsStorage }          from './fixtures/client.fixture.js'
import { createTestingGcsClientModule }  from './fixtures/module.fixture.js'

class TestingGcsClientConsumer {
  constructor(@Inject(GCS_SIGNED_URL_CLIENT) readonly storage: Storage) {}
}

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
      providers: [TestingGcsClientConsumer],
    }).compile()

    const signer = moduleRef.get(SignedUrlSigner)
    const gcsSigner = moduleRef.get(GcsSignedUrlSigner)
    const gateway = moduleRef.get<SignedUrlGateway>(SIGNED_URL_GATEWAY)
    const consumer = moduleRef.get(TestingGcsClientConsumer)

    assert.equal(signer, gcsSigner)
    assert.equal(consumer.storage, storage)

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

    const readValue = await gateway.generateReadUrl('bucket', 'file.png')

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
      providers: [TestingGcsClientConsumer],
    }).compile()

    const signer = moduleRef.get(GcsSignedUrlSigner)
    const consumer = moduleRef.get(TestingGcsClientConsumer)

    assert.equal(consumer.storage, storage)

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

  it('wires the public gcs-client module boundary into the signed-url signer', async () => {
    const { client, storage } = createFakeGcsStorage('gcs-client-boundary-signed-url')
    const gcsClientFactory: Pick<GcsClientFactory, 'create'> = {
      create: (): Storage => storage,
    }

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.gcsAsync<[GcsClientFactory]>({
          imports: [GcsClientModule.register()],
          inject: [GcsClientFactory],
          useFactory: (factory: GcsClientFactory): Storage => factory.create(),
        }),
      ],
      providers: [TestingGcsClientConsumer],
    })
      .overrideProvider(GcsClientFactory)
      .useValue(gcsClientFactory)
      .compile()

    const signer = moduleRef.get(GcsSignedUrlSigner)
    const consumer = moduleRef.get(TestingGcsClientConsumer)

    assert.equal(consumer.storage, storage)

    const value = await signer.generateWriteUrl('bucket', 'file.png', {
      contentType: 'image/png',
      expiresAt: 1730000000000,
      headers: {
        'x-goog-meta-origin': 'gcs-client-boundary',
      },
      responseDisposition: 'inline',
    })

    assert.deepEqual(value, {
      url: 'gcs-client-boundary-signed-url',
      fields: [],
    })
    assert.deepEqual(client.fileObject.params, {
      version: 'v4',
      action: 'write',
      expires: 1730000000000,
      extensionHeaders: {
        'x-goog-meta-origin': 'gcs-client-boundary',
      },
      responseDisposition: 'inline',
      contentType: 'image/png',
    })
  })
})
