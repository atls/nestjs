import type { S3Client } from '@atls/nestjs-s3-client'

export interface TestingS3ClientFactory {
  create: () => S3Client
}
