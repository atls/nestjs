import type { S3Client }           from '@atls/nestjs-s3-client'

import type { FakeS3Presigner }    from './client.interfaces.js'

import { S3Client as AwsS3Client } from '@atls/nestjs-s3-client'

export const createFakeS3Client = (): S3Client =>
  new AwsS3Client({
    credentials: {
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
    },
    endpoint: 'https://s3.example.com',
    region: 'auto',
  })

export const createFakeS3Presigner = (signedUrl = 'signed-url'): FakeS3Presigner => {
  const presigner: FakeS3Presigner = {
    async sign(client, command, options): Promise<string> {
      presigner.client = client
      presigner.command = command
      presigner.options = options

      return signedUrl
    },
  }

  return presigner
}
