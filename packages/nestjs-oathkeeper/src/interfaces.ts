export type OathkeeperHeaderValue = Array<string> | string | undefined

export type OathkeeperRequestHeaders = Record<string, OathkeeperHeaderValue>

export type OathkeeperHeaders = Record<string, string>

export interface OathkeeperHttpRequest {
  headers: OathkeeperRequestHeaders
  hostname?: string
  method?: string
  protocol?: string
  url?: string
}

export interface OathkeeperDecisionRequest {
  method: string
  uri: string
  headers?: OathkeeperRequestHeaders
  host?: string
  proto?: string
}

export interface OathkeeperDecisionResult {
  allowed: boolean
  status: number
  headers: OathkeeperHeaders
  authorization?: string
  user?: string
}

export type OathkeeperMiddlewareMode = 'enforce' | 'enrich'
