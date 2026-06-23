import type { GetSignedUrlConfig } from '@google-cloud/storage'
import type { Storage }            from '@google-cloud/storage'

export interface FakeGcsFile {
  params?: GetSignedUrlConfig
  getSignedUrl: (params: GetSignedUrlConfig) => Promise<[string]>
}

export interface FakeGcsBucket {
  file: (filename: string) => FakeGcsFile
}

export interface FakeGcsClient {
  bucketName?: string
  filename?: string
  fileObject: FakeGcsFile
  bucket: (bucketName: string) => FakeGcsBucket
}

export interface FakeGcsStorage {
  client: FakeGcsClient
  storage: Storage
}
