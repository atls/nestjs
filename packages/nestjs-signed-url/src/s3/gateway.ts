import type { GetObjectCommandInput }            from '@atls/nestjs-s3-client'
import type { PutObjectCommandInput }            from '@atls/nestjs-s3-client'
import type { S3Client }                         from '@atls/nestjs-s3-client'

import type { SignedUrlGateway }                 from '../interfaces.js'
import type { SignedUrlOptions }                 from '../interfaces.js'
import type { SignedUrl }                        from '../interfaces.js'
import type { S3SignedUrlPresignOptions }        from './interfaces.js'
import type { S3SignedUrlPresigner }             from './interfaces.js'
import type { S3SignedUrlReadOptions }           from './interfaces.js'
import type { S3SignedUrlWriteOptions }          from './interfaces.js'

import { Inject }                                from '@nestjs/common'
import { Injectable }                            from '@nestjs/common'

import { GetObjectCommand }                      from '@atls/nestjs-s3-client'
import { PutObjectCommand }                      from '@atls/nestjs-s3-client'

import { DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS } from '../constants.js'
import { S3_SIGNED_URL_CLIENT }                  from './constants.js'
import { S3_SIGNED_URL_PRESIGNER }               from './constants.js'

const MILLISECONDS_IN_SECOND = 1000
const CONTENT_TYPE_HEADER = 'content-type'

const resolveExpiresAt = (expiresAt: Date | number): number => {
  if (expiresAt instanceof Date) {
    return expiresAt.getTime()
  }

  return expiresAt
}

const resolveExpiresIn = (options: SignedUrlOptions): number => {
  if (options.expiresAt !== undefined) {
    return Math.ceil((resolveExpiresAt(options.expiresAt) - Date.now()) / MILLISECONDS_IN_SECOND)
  }

  return options.expiresInSeconds ?? DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS
}

const mergeSignableHeaders = (
  presignOptions: S3SignedUrlPresignOptions,
  headerNames: ReadonlyArray<string>
): S3SignedUrlPresignOptions => {
  if (headerNames.length === 0) {
    return presignOptions
  }

  const signableHeaders = new Set(presignOptions.signableHeaders ?? [])

  for (const headerName of headerNames) {
    signableHeaders.add(headerName.toLowerCase())
  }

  return {
    ...presignOptions,
    signableHeaders,
  }
}

const buildPresignOptions = (
  options: S3SignedUrlReadOptions | S3SignedUrlWriteOptions,
  signableHeaders: ReadonlyArray<string> = []
): S3SignedUrlPresignOptions =>
  mergeSignableHeaders(
    {
      ...options.s3?.presign,
      expiresIn: resolveExpiresIn(options),
    },
    signableHeaders
  )

const buildWriteInput = (
  bucket: string,
  filename: string,
  options: S3SignedUrlWriteOptions
): PutObjectCommandInput => {
  const input: PutObjectCommandInput = {
    ...options.s3?.command,
    Bucket: bucket,
    Key: filename,
    ContentType: options.contentType,
  }

  if (options.responseDisposition !== undefined) {
    input.ContentDisposition = options.responseDisposition
  }

  return input
}

const buildReadInput = (
  bucket: string,
  filename: string,
  options: S3SignedUrlReadOptions
): GetObjectCommandInput => {
  const input: GetObjectCommandInput = {
    ...options.s3?.command,
    Bucket: bucket,
    Key: filename,
  }

  if (options.responseDisposition !== undefined) {
    input.ResponseContentDisposition = options.responseDisposition
  }

  return input
}

@Injectable()
export class S3SignedUrlGateway
  implements SignedUrlGateway<S3SignedUrlReadOptions, S3SignedUrlWriteOptions>
{
  constructor(
    @Inject(S3_SIGNED_URL_CLIENT)
    private readonly client: S3Client,
    @Inject(S3_SIGNED_URL_PRESIGNER)
    private readonly presigner: S3SignedUrlPresigner
  ) {}

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: S3SignedUrlWriteOptions
  ): Promise<SignedUrl> {
    const command = new PutObjectCommand(buildWriteInput(bucket, filename, options))
    const url = await this.presigner(
      this.client,
      command,
      buildPresignOptions(options, [CONTENT_TYPE_HEADER])
    )

    return { url, fields: [] }
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options: S3SignedUrlReadOptions = {}
  ): Promise<SignedUrl> {
    const command = new GetObjectCommand(buildReadInput(bucket, filename, options))
    const url = await this.presigner(this.client, command, buildPresignOptions(options))

    return { url, fields: [] }
  }
}
