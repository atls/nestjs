import type { GetSignedUrlConfig } from '@google-cloud/storage'
import type { Storage }            from '@google-cloud/storage'
import type { FakeGcsBucket }      from './gcs.client.interfaces.js'
import type { FakeGcsClient }      from './gcs.client.interfaces.js'
import type { FakeGcsFile }        from './gcs.client.interfaces.js'
import type { FakeGcsStorage }     from './gcs.client.interfaces.js'

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
