import type { S3Client }               from '@atls/nestjs-s3-client'
import type { TestingModule }          from '@nestjs/testing'

import type { SignedUrlGateway }       from '../../src/interfaces.js'
import type { TestingS3ClientFactory } from './fixtures/module.interfaces.js'

import assert                          from 'node:assert/strict'
import { afterEach }                   from 'node:test'
import { describe }                    from 'node:test'
import { it }                          from 'node:test'

import { Inject }                      from '@nestjs/common'
import { Test }                        from '@nestjs/testing'

import { S3ClientFactory }             from '@atls/nestjs-s3-client'
import { S3ClientModule }              from '@atls/nestjs-s3-client'

import { SIGNED_URL_GATEWAY }          from '../../src/constants.js'
import { SignedUrlModule }             from '../../src/module/index.js'
import { S3_SIGNED_URL_CLIENT }        from '../../src/s3/index.js'
import { S3_SIGNED_URL_PRESIGNER }     from '../../src/s3/index.js'
import { S3SignedUrlSigner }           from '../../src/s3/signer.js'
import { SignedUrlSigner }             from '../../src/signer.js'
import { TESTING_S3_CLIENT_FACTORY }   from './fixtures/module.fixture.js'
import { createFakeS3Client }          from './fixtures/client.fixture.js'
import { createFakeS3Presigner }       from './fixtures/client.fixture.js'
import { createTestingS3ClientModule } from './fixtures/module.fixture.js'

class TestingS3ClientConsumer {
  constructor(@Inject(S3_SIGNED_URL_CLIENT) readonly client: S3Client) {}
}

describe('SignedUrlModule S3 APIs', () => {
  let moduleRef: TestingModule | undefined

  afterEach(async () => {
    await moduleRef?.close()
    moduleRef = undefined
  })

  it('wires a value S3 client into the signed-url signer', async () => {
    const client = createFakeS3Client()
    const presigner = createFakeS3Presigner('module-signed-url')

    moduleRef = await Test.createTestingModule({
      imports: [SignedUrlModule.s3({ useValue: client })],
      providers: [TestingS3ClientConsumer],
    })
      .overrideProvider(S3_SIGNED_URL_PRESIGNER)
      .useValue(presigner.sign)
      .compile()

    const signer = moduleRef.get(SignedUrlSigner)
    const s3Signer = moduleRef.get(S3SignedUrlSigner)
    const gateway = moduleRef.get<SignedUrlGateway>(SIGNED_URL_GATEWAY)
    const consumer = moduleRef.get(TestingS3ClientConsumer)

    assert.equal(signer, s3Signer)
    assert.equal(consumer.client, client)

    const value = await signer.generateWriteUrl('bucket', 'file.png', {
      contentType: 'image/png',
      expiresInSeconds: 60,
    })

    assert.deepEqual(value, {
      url: 'module-signed-url',
      fields: [],
    })
    assert.deepEqual(presigner.command?.input, {
      Bucket: 'bucket',
      Key: 'file.png',
      ContentType: 'image/png',
    })
    assert.deepEqual(presigner.options, {
      expiresIn: 60,
      signableHeaders: new Set(['content-type']),
    })

    const readValue = await gateway.generateReadUrl('bucket', 'file.png')

    assert.deepEqual(readValue, {
      url: 'module-signed-url',
      fields: [],
    })
  })

  it('wires an injected S3 client factory into the signed-url signer', async () => {
    const client = createFakeS3Client()
    const presigner = createFakeS3Presigner('module-async-signed-url')

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.s3Async<[TestingS3ClientFactory]>({
          imports: [createTestingS3ClientModule(client)],
          inject: [TESTING_S3_CLIENT_FACTORY],
          useFactory: (clientFactory: TestingS3ClientFactory): S3Client => clientFactory.create(),
        }),
      ],
      providers: [TestingS3ClientConsumer],
    })
      .overrideProvider(S3_SIGNED_URL_PRESIGNER)
      .useValue(presigner.sign)
      .compile()

    const signer = moduleRef.get(S3SignedUrlSigner)
    const consumer = moduleRef.get(TestingS3ClientConsumer)

    assert.equal(consumer.client, client)

    const value = await signer.generateReadUrl('bucket', 'file.png', {
      expiresInSeconds: 30,
      s3: {
        command: {
          VersionId: 'version-id',
        },
      },
    })

    assert.deepEqual(value, {
      url: 'module-async-signed-url',
      fields: [],
    })
    assert.deepEqual(presigner.command?.input, {
      VersionId: 'version-id',
      Bucket: 'bucket',
      Key: 'file.png',
    })
  })

  it('wires the public s3-client module boundary into the signed-url signer', async () => {
    const client = createFakeS3Client()
    const presigner = createFakeS3Presigner('s3-client-boundary-signed-url')
    const s3ClientFactory: Pick<S3ClientFactory, 'create'> = {
      create: (): S3Client => client,
    }

    moduleRef = await Test.createTestingModule({
      imports: [
        SignedUrlModule.s3Async<[S3ClientFactory]>({
          imports: [S3ClientModule.register()],
          inject: [S3ClientFactory],
          useFactory: (factory: S3ClientFactory): S3Client => factory.create(),
        }),
      ],
      providers: [TestingS3ClientConsumer],
    })
      .overrideProvider(S3ClientFactory)
      .useValue(s3ClientFactory)
      .overrideProvider(S3_SIGNED_URL_PRESIGNER)
      .useValue(presigner.sign)
      .compile()

    const signer = moduleRef.get(S3SignedUrlSigner)
    const consumer = moduleRef.get(TestingS3ClientConsumer)

    assert.equal(consumer.client, client)

    const value = await signer.generateWriteUrl('bucket', 'file.png', {
      contentType: 'image/png',
      expiresInSeconds: 60,
      s3: {
        command: {
          Metadata: {
            source: 's3-client-boundary',
          },
        },
      },
    })

    assert.deepEqual(value, {
      url: 's3-client-boundary-signed-url',
      fields: [],
    })
    assert.deepEqual(presigner.command?.input, {
      Metadata: {
        source: 's3-client-boundary',
      },
      Bucket: 'bucket',
      Key: 'file.png',
      ContentType: 'image/png',
    })
    assert.deepEqual(presigner.options, {
      expiresIn: 60,
      signableHeaders: new Set(['content-type']),
    })
  })
})
