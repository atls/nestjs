import type { FakeS3Presigner }  from './fixtures/client.interfaces.js'

import assert                    from 'node:assert/strict'
import { beforeEach }            from 'node:test'
import { describe }              from 'node:test'
import { it }                    from 'node:test'
import { mock }                  from 'node:test'

import { GetObjectCommand }      from '@atls/nestjs-s3-client'
import { PutObjectCommand }      from '@atls/nestjs-s3-client'

import { S3SignedUrlGateway }    from '../../src/s3/gateway.js'
import { createFakeS3Client }    from './fixtures/client.fixture.js'
import { createFakeS3Presigner } from './fixtures/client.fixture.js'

describe('S3SignedUrlGateway', () => {
  let gateway: S3SignedUrlGateway
  let client: ReturnType<typeof createFakeS3Client>
  let presigner: FakeS3Presigner

  beforeEach(() => {
    client = createFakeS3Client()
    presigner = createFakeS3Presigner()
    gateway = new S3SignedUrlGateway(client, presigner.sign)
  })

  describe('generateWriteUrl', () => {
    it('maps provider-neutral write options to PutObjectCommand and getSignedUrl', async () => {
      const dateNowMock = mock.method(Date, 'now', () => 1000)

      try {
        const value = await gateway.generateWriteUrl('bucket', 'file.png', {
          contentType: 'image/png',
          expiresAt: 61000,
          headers: {
            'content-type': 'image/png',
          },
          responseDisposition: 'inline',
          s3: {
            command: {
              CacheControl: 'public, max-age=60',
              Metadata: {
                source: 'gateway-test',
              },
            },
            presign: {
              unhoistableHeaders: new Set(['x-amz-meta-source']),
            },
          },
        })

        assert.deepEqual(value, {
          url: 'signed-url',
          fields: [],
        })
        assert.equal(presigner.client, client)
        assert.ok(presigner.command instanceof PutObjectCommand)
        assert.deepEqual(presigner.command.input, {
          CacheControl: 'public, max-age=60',
          Metadata: {
            source: 'gateway-test',
          },
          Bucket: 'bucket',
          Key: 'file.png',
          ContentType: 'image/png',
          ContentDisposition: 'inline',
        })
        assert.deepEqual(presigner.options, {
          expiresIn: 60,
          signableHeaders: new Set(['content-type']),
          unhoistableHeaders: new Set(['x-amz-meta-source']),
        })
      } finally {
        dateNowMock.mock.restore()
      }
    })
  })

  describe('generateReadUrl', () => {
    it('maps provider-neutral read options to GetObjectCommand and getSignedUrl', async () => {
      const value = await gateway.generateReadUrl('bucket', 'file.png', {
        expiresInSeconds: 30,
        responseDisposition: 'attachment; filename="file.png"',
        s3: {
          command: {
            Range: 'bytes=0-1023',
            VersionId: 'version-id',
          },
          presign: {
            unsignableHeaders: new Set(['x-amz-checksum-mode']),
          },
        },
      })

      assert.deepEqual(value, {
        url: 'signed-url',
        fields: [],
      })
      assert.equal(presigner.client, client)
      assert.ok(presigner.command instanceof GetObjectCommand)
      assert.deepEqual(presigner.command.input, {
        Range: 'bytes=0-1023',
        VersionId: 'version-id',
        Bucket: 'bucket',
        Key: 'file.png',
        ResponseContentDisposition: 'attachment; filename="file.png"',
      })
      assert.deepEqual(presigner.options, {
        expiresIn: 30,
        unsignableHeaders: new Set(['x-amz-checksum-mode']),
      })
    })

    it('uses the package default expiration for read urls', async () => {
      await gateway.generateReadUrl('bucket', 'file.png')

      assert.ok(presigner.command instanceof GetObjectCommand)
      assert.deepEqual(presigner.command.input, {
        Bucket: 'bucket',
        Key: 'file.png',
      })
      assert.deepEqual(presigner.options, {
        expiresIn: 900,
      })
    })
  })
})
