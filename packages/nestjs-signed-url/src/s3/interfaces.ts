import type { GetObjectCommand }      from '@atls/nestjs-s3-client'
import type { GetObjectCommandInput } from '@atls/nestjs-s3-client'
import type { PutObjectCommand }      from '@atls/nestjs-s3-client'
import type { PutObjectCommandInput } from '@atls/nestjs-s3-client'
import type { S3Client }              from '@atls/nestjs-s3-client'
import type { getSignedUrl }          from '@atls/nestjs-s3-client'

import type { SignedUrlReadOptions }  from '../interfaces.js'
import type { SignedUrlSigning }      from '../interfaces.js'
import type { SignedUrlWriteOptions } from '../interfaces.js'

export type S3SignedUrlPresignOptions = NonNullable<Parameters<typeof getSignedUrl>[2]>

type S3SignedUrlBaseReadOptions = Omit<SignedUrlReadOptions, 'headers'>

type S3SignedUrlBaseWriteOptions = Omit<SignedUrlWriteOptions, 'headers'>

export type S3SignedUrlReadCommandInput = Partial<
  Omit<GetObjectCommandInput, 'Bucket' | 'Key' | 'ResponseContentDisposition'>
>

export type S3SignedUrlWriteCommandInput = Partial<
  Omit<PutObjectCommandInput, 'Bucket' | 'ContentDisposition' | 'ContentType' | 'Key'>
>

export interface S3SignedUrlConfig<CommandInput> {
  command?: CommandInput
  presign?: S3SignedUrlPresignOptions
}

export interface S3SignedUrlReadOptions extends S3SignedUrlBaseReadOptions {
  s3?: S3SignedUrlConfig<S3SignedUrlReadCommandInput>
}

export interface S3SignedUrlWriteOptions extends S3SignedUrlBaseWriteOptions {
  s3?: S3SignedUrlConfig<S3SignedUrlWriteCommandInput>
}

export type S3SignedUrlCommand = GetObjectCommand | PutObjectCommand

export type S3SignedUrlPresigner = (
  client: S3Client,
  command: S3SignedUrlCommand,
  options?: S3SignedUrlPresignOptions
) => Promise<string>

export type S3SignedUrlSigning = SignedUrlSigning<S3SignedUrlReadOptions, S3SignedUrlWriteOptions>
