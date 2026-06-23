import type { GetSignedUrlConfig }               from '@google-cloud/storage'
import type { Storage }                          from '@google-cloud/storage'

import type { SignedUrlOptions }                 from '../interfaces.js'
import type { SignedUrl }                        from '../interfaces.js'
import type { GcsSignedUrlReadOptions }          from './interfaces.js'
import type { GcsSignedUrlWriteOptions }         from './interfaces.js'

import { Inject }                                from '@nestjs/common'
import { Injectable }                            from '@nestjs/common'

import { DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS } from '../constants.js'
import { SignedUrlProvider }                     from '../provider.js'
import { GCS_SIGNED_URL_CLIENT }                 from './constants.js'

const MILLISECONDS_IN_SECOND = 1000

type GcsSignedUrlAction = Extract<GetSignedUrlConfig['action'], 'read' | 'write'>

const resolveExpires = (options: SignedUrlOptions): GetSignedUrlConfig['expires'] => {
  if (options.expiresAt !== undefined) {
    return options.expiresAt
  }

  return (
    Date.now() +
    (options.expiresInSeconds ?? DEFAULT_SIGNED_URL_EXPIRES_IN_SECONDS) * MILLISECONDS_IN_SECOND
  )
}

const buildGcsConfig = (
  action: GcsSignedUrlAction,
  options: GcsSignedUrlReadOptions | GcsSignedUrlWriteOptions
): GetSignedUrlConfig => {
  const config: GetSignedUrlConfig = {
    version: 'v4',
    ...options.gcs,
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
export class GcsSignedUrlGateway extends SignedUrlProvider<
  GcsSignedUrlReadOptions,
  GcsSignedUrlWriteOptions
> {
  constructor(@Inject(GCS_SIGNED_URL_CLIENT) private readonly client: Storage) {
    super()
  }

  async generateWriteUrl(
    bucket: string,
    filename: string,
    options: GcsSignedUrlWriteOptions
  ): Promise<SignedUrl> {
    const params: GetSignedUrlConfig = {
      ...buildGcsConfig('write', options),
      contentType: options.contentType,
    }

    const [url] = await this.client.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }

  async generateReadUrl(
    bucket: string,
    filename: string,
    options: GcsSignedUrlReadOptions = {}
  ): Promise<SignedUrl> {
    const params = buildGcsConfig('read', options)

    const [url] = await this.client.bucket(bucket).file(filename).getSignedUrl(params)

    return { url, fields: [] }
  }
}
