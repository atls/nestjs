import type { SignedUrl }        from '../src/interfaces.js'

import assert                    from 'node:assert/strict'
import { describe }              from 'node:test'
import { it }                    from 'node:test'
import { mock }                  from 'node:test'

import { GetObjectCommand }      from '@atls/nestjs-s3-client'
import { PutObjectCommand }      from '@atls/nestjs-s3-client'

import { GcsSignedUrlGateway }   from '../src/gcs/gateway.js'
import { S3SignedUrlGateway }    from '../src/s3/gateway.js'
import { createFakeGcsStorage }  from '../gcs/tests/fixtures/client.fixture.js'
import { createFakeS3Client }    from '../s3/tests/fixtures/client.fixture.js'
import { createFakeS3Presigner } from '../s3/tests/fixtures/client.fixture.js'

const NOW = 1000
const EXPIRES_IN_SECONDS = 30
const EXPIRES_AT = NOW + EXPIRES_IN_SECONDS * 1000
const WRITE_CONTENT_TYPE = 'image/png'
const WRITE_DISPOSITION = 'inline'
const READ_DISPOSITION = 'attachment; filename="file.png"'

interface SignedUrlGatewayTestHarness {
  generateWriteUrl: () => Promise<SignedUrl>
  generateReadUrl: () => Promise<SignedUrl>
  assertWriteMapping: () => void
  assertReadMapping: () => void
}

const createGcsHarness = (): SignedUrlGatewayTestHarness => {
  const fixture = createFakeGcsStorage()
  const gateway = new GcsSignedUrlGateway(fixture.storage)

  return {
    generateWriteUrl: async () =>
      gateway.generateWriteUrl('bucket', 'file.png', {
        contentType: WRITE_CONTENT_TYPE,
        expiresInSeconds: EXPIRES_IN_SECONDS,
        responseDisposition: WRITE_DISPOSITION,
      }),
    generateReadUrl: async () =>
      gateway.generateReadUrl('bucket', 'file.png', {
        expiresInSeconds: EXPIRES_IN_SECONDS,
        responseDisposition: READ_DISPOSITION,
      }),
    assertWriteMapping: () => {
      assert.equal(fixture.client.bucketName, 'bucket')
      assert.equal(fixture.client.filename, 'file.png')
      assert.deepEqual(fixture.client.fileObject.params, {
        version: 'v4',
        action: 'write',
        expires: EXPIRES_AT,
        responseDisposition: WRITE_DISPOSITION,
        contentType: WRITE_CONTENT_TYPE,
      })
    },
    assertReadMapping: () => {
      assert.equal(fixture.client.bucketName, 'bucket')
      assert.equal(fixture.client.filename, 'file.png')
      assert.deepEqual(fixture.client.fileObject.params, {
        version: 'v4',
        action: 'read',
        expires: EXPIRES_AT,
        responseDisposition: READ_DISPOSITION,
      })
    },
  }
}

const createS3Harness = (): SignedUrlGatewayTestHarness => {
  const client = createFakeS3Client()
  const presigner = createFakeS3Presigner()
  const gateway = new S3SignedUrlGateway(client, presigner.sign)

  return {
    generateWriteUrl: async () =>
      gateway.generateWriteUrl('bucket', 'file.png', {
        contentType: WRITE_CONTENT_TYPE,
        expiresInSeconds: EXPIRES_IN_SECONDS,
        responseDisposition: WRITE_DISPOSITION,
      }),
    generateReadUrl: async () =>
      gateway.generateReadUrl('bucket', 'file.png', {
        expiresInSeconds: EXPIRES_IN_SECONDS,
        responseDisposition: READ_DISPOSITION,
      }),
    assertWriteMapping: () => {
      assert.equal(presigner.client, client)
      assert.ok(presigner.command instanceof PutObjectCommand)
      assert.deepEqual(presigner.command.input, {
        Bucket: 'bucket',
        Key: 'file.png',
        ContentType: WRITE_CONTENT_TYPE,
        ContentDisposition: WRITE_DISPOSITION,
      })
      assert.deepEqual(presigner.options, {
        expiresIn: EXPIRES_IN_SECONDS,
        signableHeaders: new Set(['content-type']),
      })
    },
    assertReadMapping: () => {
      assert.equal(presigner.client, client)
      assert.ok(presigner.command instanceof GetObjectCommand)
      assert.deepEqual(presigner.command.input, {
        Bucket: 'bucket',
        Key: 'file.png',
        ResponseContentDisposition: READ_DISPOSITION,
      })
      assert.deepEqual(presigner.options, {
        expiresIn: EXPIRES_IN_SECONDS,
      })
    },
  }
}

const gatewayProviders = [
  {
    name: 'GCS',
    createHarness: createGcsHarness,
  },
  {
    name: 'S3/R2',
    createHarness: createS3Harness,
  },
]

describe('SignedUrlGateway implementations', () => {
  for (const { name, createHarness } of gatewayProviders) {
    describe(name, () => {
      it('generates write URLs from the shared write options', async () => {
        const dateNowMock = mock.method(Date, 'now', () => NOW)

        try {
          const harness = createHarness()

          const value = await harness.generateWriteUrl()

          assert.deepEqual(value, {
            url: 'signed-url',
            fields: [],
          })
          harness.assertWriteMapping()
        } finally {
          dateNowMock.mock.restore()
        }
      })

      it('generates read URLs from the shared read options', async () => {
        const dateNowMock = mock.method(Date, 'now', () => NOW)

        try {
          const harness = createHarness()

          const value = await harness.generateReadUrl()

          assert.deepEqual(value, {
            url: 'signed-url',
            fields: [],
          })
          harness.assertReadMapping()
        } finally {
          dateNowMock.mock.restore()
        }
      })
    })
  }
})
