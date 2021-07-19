import { LoginRequest } from '@ory/hydra-client'

export const extractLoginRequestState = (body: LoginRequest) => {
  if (!body.request_url) {
    return {}
  }

  try {
    const requestUrl = new URL(body.request_url)

    const state = requestUrl.searchParams.get('state')

    if (!state) {
      return {}
    }

    return JSON.parse(Buffer.from(state, 'base64').toString('utf8'))
  } catch {
    // TODO: log error

    return {}
  }
}
