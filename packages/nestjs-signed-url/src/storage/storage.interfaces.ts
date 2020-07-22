export interface SignedUrlField {
  key: string
  value: string
}
export interface SignedUrl {
  url: string
  fields?: SignedUrlField[]
}
export interface SignUrlOptions {
  type: string
}
