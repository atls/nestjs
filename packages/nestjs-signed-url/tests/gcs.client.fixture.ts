import type { GetSignedUrlConfig } from '@google-cloud/storage'
import type { Storage }            from '@google-cloud/storage'

export type FakeGcsFile = {
  params?: GetSignedUrlConfig
  getSignedUrl: (params: GetSignedUrlConfig) => Promise<[string]>
}

export type FakeGcsBucket = {
  file: (filename: string) => FakeGcsFile
}

export type FakeGcsClient = {
  bucketName?: string
  filename?: string
  fileObject: FakeGcsFile
  bucket: (bucketName: string) => FakeGcsBucket
}

export type FakeGcsStorage = {
  client: FakeGcsClient
  storage: Storage
}

export const createFakeGcsClient = (signedUrl = 'signed-url'): FakeGcsClient => {
  const fileObject: FakeGcsFile = {
    async getSignedUrl(params: GetSignedUrlConfig): Promise<[string]> {
      fileObject.params = params

      return [signedUrl]
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

export const createFakeGcsStorage = (signedUrl?: string): FakeGcsStorage => {
  const client = createFakeGcsClient(signedUrl)

  return {
    client,
    storage: client as unknown as Storage,
  }
}
