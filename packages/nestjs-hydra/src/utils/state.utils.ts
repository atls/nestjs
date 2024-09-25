import type { LoginRequest } from '@ory/hydra-client'

type LoginRequestState = Record<string, any>

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(Buffer.from(state, 'base64').toString('utf8'))
  } catch {
    // TODO: log error

    return {}
  }
}
