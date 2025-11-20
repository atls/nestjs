import type { LoginRequest } from '@ory/hydra-client'

type LoginRequestState = Record<string, unknown>

const parseState = (encodedState: string): LoginRequestState => {
  const decodedState = Buffer.from(encodedState, 'base64').toString('utf8')
  const parsedState: unknown = JSON.parse(decodedState)

  if (parsedState && typeof parsedState === 'object' && !Array.isArray(parsedState)) {
    return parsedState as Record<string, unknown>
  }

  return {}
}

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

    return parseState(state)
  } catch {
    // TODO: log error

    return {}
  }
}
