import type { GetSignedUrlConfig } from '@google-cloud/storage'
import type { Storage }            from '@google-cloud/storage'

import assert                      from 'node:assert/strict'
import { beforeEach }              from 'node:test'
import { describe }                from 'node:test'
import { it }                      from 'node:test'
import { mock }                    from 'node:test'

import { GcsSignedUrlGateway }     from '../gateway.js'

interface FakeGcsFile {
  params?: GetSignedUrlConfig
  getSignedUrl: (params: GetSignedUrlConfig) => Promise<[string]>
}

interface FakeGcsBucket {
  file: (filename: string) => FakeGcsFile
}

interface FakeGcsClient {
  bucketName?: string
  filename?: string
  fileObject: FakeGcsFile
  bucket: (bucketName: string) => FakeGcsBucket
}

const createFakeGcsClient = (): FakeGcsClient => {
  const fileObject: FakeGcsFile = {
    async getSignedUrl(params: GetSignedUrlConfig): Promise<[string]> {
      fileObject.params = params

      return ['signed-url']
    },
  }

  const client: FakeGcsClient = {
    fileObject,

    bucket(bucketName: string): FakeGcsBucket {
      client.bucketName = bucketName

      return {
        file(filename: string): FakeGcsFile {
          client.filename = filename

          return fileObject
        },
      }
    },
  }

  return client
}

const createGateway = (client: FakeGcsClient): GcsSignedUrlGateway =>
  new GcsSignedUrlGateway(client as unknown as Storage)

describe('GcsSignedUrlGateway', () => {
  let gateway: GcsSignedUrlGateway
  let client: FakeGcsClient

  beforeEach(() => {
    client = createFakeGcsClient()
    gateway = createGateway(client)
  })

  describe('generateWriteUrl', () => {
    it('generates write urls through the package signing boundary', async () => {
      const value = await gateway.generateWriteUrl('bucket', 'file.png', {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-signed-url-origin': 'gateway-test',
        },
        responseDisposition: 'inline',
      })

      assert.deepEqual(value, {
        url: 'signed-url',
        fields: [],
      })
    })

    it('maps provider-neutral write options to the GCS signed-url config', async () => {
      const value = await gateway.generateWriteUrl('bucket', 'file.png', {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-goog-meta-origin': 'test',
        },
        responseDisposition: 'inline',
      })

      assert.deepEqual(value, {
        url: 'signed-url',
        fields: [],
      })
      assert.equal(client.bucketName, 'bucket')
      assert.equal(client.filename, 'file.png')
      assert.deepEqual(client.fileObject.params, {
        version: 'v4',
        action: 'write',
        expires: 1730000000000,
        extensionHeaders: {
          'x-goog-meta-origin': 'test',
        },
        responseDisposition: 'inline',
        contentType: 'image/png',
      })
    })
  })

  describe('generateReadUrl', () => {
    it('generates read urls through the package signing boundary', async () => {
      const value = await gateway.generateReadUrl('bucket', 'file.png', {
        expiresInSeconds: 30,
        responseDisposition: 'attachment; filename="file.png"',
      })

      assert.deepEqual(value, {
        url: 'signed-url',
        fields: [],
      })
    })

    it('maps provider-neutral read options to the GCS signed-url config', async () => {
      const dateNowMock = mock.method(Date, 'now', () => 1000)

      try {
        const value = await gateway.generateReadUrl('bucket', 'file.png', {
          expiresInSeconds: 30,
          headers: {
            'x-goog-if-generation-match': '1',
          },
          responseDisposition: 'attachment; filename="file.png"',
        })

        assert.deepEqual(value, {
          url: 'signed-url',
          fields: [],
        })
        assert.equal(client.bucketName, 'bucket')
        assert.equal(client.filename, 'file.png')
        assert.deepEqual(client.fileObject.params, {
          version: 'v4',
          action: 'read',
          expires: 31000,
          extensionHeaders: {
            'x-goog-if-generation-match': '1',
          },
          responseDisposition: 'attachment; filename="file.png"',
        })
      } finally {
        dateNowMock.mock.restore()
      }
    })
  })
})
