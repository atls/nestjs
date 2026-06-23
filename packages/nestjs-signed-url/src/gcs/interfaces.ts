import type { GetSignedUrlConfig }    from '@google-cloud/storage'

import type { SignedUrlReadOptions }  from '../interfaces.js'
import type { SignedUrlWriteOptions } from '../interfaces.js'

export type GcsSignedUrlConfig = Partial<
  Omit<
    GetSignedUrlConfig,
    'action' | 'contentType' | 'expires' | 'extensionHeaders' | 'responseDisposition'
  >
>

export interface GcsSignedUrlReadOptions extends SignedUrlReadOptions {
  gcs?: GcsSignedUrlConfig
}

export interface GcsSignedUrlWriteOptions extends SignedUrlWriteOptions {
  gcs?: GcsSignedUrlConfig
}
