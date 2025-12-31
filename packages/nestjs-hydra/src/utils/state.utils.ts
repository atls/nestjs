import type { LoginRequest } from '@ory/hydra-client'

type LoginRequestState = Record<string, unknown>

export const extractLoginRequestState = (body: LoginRequest): LoginRequestState => {
  if (!body.request_url) {
    return {}
  }

  try {
    const requestUrl = new URL(body.request_url)

    const state = requestUrl.searchParams.get('state')

    if (!state) {
      return {}
    }

    const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8')) as unknown
    if (parsed && typeof parsed === 'object') {
      return parsed as LoginRequestState
    }
    return {}
  } catch {
    // TODO: log error

    return {}
  }
}
