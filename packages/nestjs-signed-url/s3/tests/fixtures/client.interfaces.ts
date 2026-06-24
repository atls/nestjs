import type { GetObjectCommand }            from '@atls/nestjs-s3-client'
import type { PutObjectCommand }            from '@atls/nestjs-s3-client'
import type { S3Client }                    from '@atls/nestjs-s3-client'

import type { S3SignedUrlPresigner }        from '../../../src/s3/interfaces.js'
import type { S3SignedUrlPresignerOptions } from '../../../src/s3/interfaces.js'

export type FakeS3Command = GetObjectCommand | PutObjectCommand

export interface FakeS3Presigner {
  client?: S3Client
  command?: FakeS3Command
  options?: S3SignedUrlPresignerOptions
  sign: S3SignedUrlPresigner
}
