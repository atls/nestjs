import type { GetSignedUrlConfig }    from '@google-cloud/storage'
import type { Storage }               from '@google-cloud/storage'

import type { SignedUrlReadOptions }  from '../storage/index.js'
import type { SignedUrlWriteOptions } from '../storage/index.js'
import type { SignedUrl }             from '../storage/index.js'
import type { AbstractStorage }       from '../storage/index.js'

import assert                         from 'node:assert/strict'
import { beforeEach }                 from 'node:test'
import { describe }                   from 'node:test'
import { it }                         from 'node:test'
import { mock }                       from 'node:test'

import { Test }                       from '@nestjs/testing'

import { SignedUrlService }           from '../index.js'
import { GcsStorage }                 from '../storage/index.js'
import { STORAGE }                    from '../storage/index.js'

interface WriteCall {
  bucket: string
  filename: string
  options: SignedUrlWriteOptions
}

interface ReadCall {
  bucket: string
  filename: string
  options: SignedUrlReadOptions
}

type TestingStorage = AbstractStorage & {
  writeCalls: Array<WriteCall>
  readCalls: Array<ReadCall>
}

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

const createTestingStorage = (): TestingStorage => {
  const writeCalls: Array<WriteCall> = []
  const readCalls: Array<ReadCall> = []

  return {
    writeCalls,
    readCalls,

    async generateWriteUrl(
      bucket: string,
      filename: string,
      options: SignedUrlWriteOptions
    ): Promise<SignedUrl> {
      writeCalls.push({
        bucket,
        filename,
        options,
      })

      return {
        url: 'write-url',
        fields: [],
      }
    },

    async generateReadUrl(
      bucket: string,
      filename: string,
      options: SignedUrlReadOptions = {}
    ): Promise<SignedUrl> {
      readCalls.push({
        bucket,
        filename,
        options,
      })

      return {
        url: 'read-url',
        fields: [],
      }
    },
  }
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

describe('SignedUrlWriteOptions', () => {
  it('exposes contentType without the legacy type option', () => {
    type HasContentType = 'contentType' extends keyof SignedUrlWriteOptions ? true : false
    type HasLegacyType = 'type' extends keyof SignedUrlWriteOptions ? true : false

    const hasContentType: HasContentType = true
    const hasLegacyType: HasLegacyType = false

    assert.equal(hasContentType, true)
    assert.equal(hasLegacyType, false)
  })
})

describe('SignedUrlService', () => {
  let signedUrlService: SignedUrlService
  let storage: TestingStorage

  beforeEach(async () => {
    storage = createTestingStorage()

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignedUrlService,
        {
          provide: STORAGE,
          useValue: storage,
        },
      ],
      exports: [SignedUrlService],
    }).compile()

    signedUrlService = moduleRef.get<SignedUrlService>(SignedUrlService)
  })

  describe('generateWriteUrl', () => {
    it('delegates bucket, filename, and write options to storage', async () => {
      const options: SignedUrlWriteOptions = {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-goog-meta-origin': 'test',
        },
        responseDisposition: 'inline',
      }

      const value = await signedUrlService.generateWriteUrl('bucket', 'file.png', options)

      assert.deepEqual(value, {
        url: 'write-url',
        fields: [],
      })
      assert.deepEqual(storage.writeCalls, [
        {
          bucket: 'bucket',
          filename: 'file.png',
          options,
        },
      ])
    })
  })

  describe('generateReadUrl', () => {
    it('delegates bucket, filename, and read options to storage', async () => {
      const options: SignedUrlReadOptions = {
        expiresInSeconds: 30,
        responseDisposition: 'attachment; filename="file.png"',
      }

      const value = await signedUrlService.generateReadUrl('bucket', 'file.png', options)

      assert.deepEqual(value, {
        url: 'read-url',
        fields: [],
      })
      assert.deepEqual(storage.readCalls, [
        {
          bucket: 'bucket',
          filename: 'file.png',
          options,
        },
      ])
    })
  })
})

describe('GcsStorage', () => {
  let gcsStorage: GcsStorage
  let gcsClient: FakeGcsClient

  beforeEach(() => {
    gcsStorage = new GcsStorage()
    gcsClient = createFakeGcsClient()
    gcsStorage.storage = gcsClient as unknown as Storage
  })

  describe('generateWriteUrl', () => {
    it('maps provider-neutral write options to the GCS signed-url config', async () => {
      const value = await gcsStorage.generateWriteUrl('bucket', 'file.png', {
        contentType: 'image/png',
        expiresAt: 1730000000000,
        headers: {
          'x-goog-meta-origin': 'test',
        },
        providerOptions: {
          gcs: {
            queryParams: {
              source: 'contract-test',
            },
            virtualHostedStyle: true,
          },
        },
        responseDisposition: 'inline',
      })

      assert.deepEqual(value, {
        url: 'signed-url',
        fields: [],
      })
      assert.equal(gcsClient.bucketName, 'bucket')
      assert.equal(gcsClient.filename, 'file.png')
      assert.deepEqual(gcsClient.fileObject.params, {
        version: 'v4',
        queryParams: {
          source: 'contract-test',
        },
        virtualHostedStyle: true,
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
    it('maps provider-neutral read options to the GCS signed-url config', async () => {
      const dateNowMock = mock.method(Date, 'now', () => 1000)

      try {
        const value = await gcsStorage.generateReadUrl('bucket', 'file.png', {
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
        assert.equal(gcsClient.bucketName, 'bucket')
        assert.equal(gcsClient.filename, 'file.png')
        assert.deepEqual(gcsClient.fileObject.params, {
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
