export type SignedUrlHeaders = Record<string, string>

export interface SignedUrlField {
  key: string
  value: string
}

export interface SignedUrl {
  url: string
  fields?: Array<SignedUrlField>
}

export interface SignedUrlOptions {
  expiresAt?: Date | number
  expiresInSeconds?: number
  headers?: SignedUrlHeaders
  responseDisposition?: string
}

export type SignedUrlReadOptions = SignedUrlOptions

export interface SignedUrlWriteOptions extends SignedUrlOptions {
  contentType: string
}

export interface SignedUrlGateway<
  ReadOptions extends SignedUrlReadOptions = SignedUrlReadOptions,
  WriteOptions extends SignedUrlWriteOptions = SignedUrlWriteOptions,
> {
  generateWriteUrl: (bucket: string, filename: string, options: WriteOptions) => Promise<SignedUrl>

  generateReadUrl: (bucket: string, filename: string, options?: ReadOptions) => Promise<SignedUrl>
}
