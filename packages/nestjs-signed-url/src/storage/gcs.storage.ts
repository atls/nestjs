import type { GetSignedUrlConfig }               from '@google-cloud/storage'
import type { Storage }                          from '@google-cloud/storage'
import type { OnModuleInit }                     from '@nestjs/common'

import type { SignedUrlOptions }                 from './storage.interfaces.js'
import type { SignedUrlReadOptions }             from './storage.interfaces.js'
import type { SignedUrlWriteOptions }            from './storage.interfaces.js'
import type { SignedUrl }                        from './storage.interfaces.js'

import { Injectable }                            from '@nestjs/common'

import { AbstractStorage }                       from './abstract.storage.js'
import { DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS } from './constants.js'

const MILLISECONDS_IN_SECOND = 1000

type GcsSignedUrlAction = Extract<GetSignedUrlConfig['action'], 'read' | 'write'>

type GcsProviderOptions = Partial<
  Omit<
    GetSignedUrlConfig,
    'action' | 'contentType' | 'expires' | 'extensionHeaders' | 'responseDisposition'
  >
>

const resolveExpires = (options: SignedUrlOptions): GetSignedUrlConfig['expires'] => {
  if (options.expiresAt !== undefined) {
    return options.expiresAt
  }

  return (
    Date.now() +
    (options.expiresInSeconds ?? DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS) * MILLISECONDS_IN_SECOND
  )
}

const resolveGcsProviderOptions = (options: SignedUrlOptions): GcsProviderOptions =>
  (options.providerOptions?.gcs ?? {}) as GcsProviderOptions

const buildGcsConfig = (
  action: GcsSignedUrlAction,
  options: SignedUrlOptions
): GetSignedUrlConfig => {
  const config: GetSignedUrlConfig = {
    version: 'v4',
    ...resolveGcsProviderOptions(options),
    action,
    expires: resolveExpires(options),
  }

  if (options.headers !== undefined) {
    config.extensionHeaders = options.headers
  }

  if (options.responseDisposition !== undefined) {
    config.responseDisposition = options.responseDisposition
  }

  return config
}

@Injectable()
export class GcsStorage extends AbstractStorage implements OnModuleInit {
  storage: Storage

  bucket: string

  async onModuleInit(): Promise<void> {
    const { Storage } = await import('@google-cloud/storage')

    this.storage = new Storage()
  }

  async generateWriteUrl(
    bucketName: string,
    filename: string,
    options: SignedUrlWriteOptions
  ): Promise<SignedUrl> {
    const params: GetSignedUrlConfig = {
      ...buildGcsConfig('write', options),
      contentType: options.contentType,
    }

    const bucket = this.storage.bucket(bucketName)
    const file = bucket.file(filename)
    const [url] = await file.getSignedUrl(params)

    return { url, fields: [] }
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options: SignedUrlReadOptions = {}
  ): Promise<SignedUrl> {
    const params = buildGcsConfig('read', options)

    const [url] = await this.storage.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }
}
