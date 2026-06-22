export type SignedUrlHeaders = Record<string, string>

export interface SignedUrlField {
  key: string
  value: string
}

export interface SignedUrl {
  url: string
  fields?: Array<SignedUrlField>
}

export interface SignedUrlProviderOptions {
  gcs?: Record<string, unknown>
}

export interface SignedUrlOptions {
  expiresAt?: Date | number
  expiresInSeconds?: number
  headers?: SignedUrlHeaders
  providerOptions?: SignedUrlProviderOptions
  responseDisposition?: string
}

export type SignedUrlReadOptions = SignedUrlOptions

export interface SignedUrlWriteOptions extends SignedUrlOptions {
  contentType: string
}
