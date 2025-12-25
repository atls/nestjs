import { jest }                             from '@jest/globals'
import { expect }                           from '@jest/globals'
import { it }                               from '@jest/globals'
import { describe }                         from '@jest/globals'
import { beforeAll }                        from '@jest/globals'
import { afterEach }                        from '@jest/globals'
import { Response }                         from 'node-fetch'
import fetchMock                            from 'jest-fetch-mock'

import { ExpressExternalRendererView }      from './express-external-renderer.view.js'
import type { ExpressExternalRendererViewParams } from './express-external-renderer.view.js'

fetchMock.default.enableMocks()

type FetchResponse = Awaited<ReturnType<typeof fetch>>

const fetchMocked = fetch as jest.MockedFunction<typeof fetch>

describe('ExpressExternalRendererView', () => {
  let render: (params?: ExpressExternalRendererViewParams) => Promise<void>

  beforeAll(async () => {
    const view = new ExpressExternalRendererView('/test', {
      root: `http://localhost:3000`,
    })

    render = async (params: ExpressExternalRendererViewParams = {}): Promise<void> =>
      new Promise((resolve) => {
        view.render(params, resolve)
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('pass querie variables', async () => {
    fetchMocked.mockResolvedValue(new Response('') as unknown as FetchResponse)

    await render({
      query: {
        foo: 'bar',
      },
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/test?foo=bar', {
      method: 'POST',
      body: '{}',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('pass data', async () => {
    fetchMocked.mockResolvedValue(new Response('') as unknown as FetchResponse)

    await render({
      data: {
        foo: 'bar',
      },
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
      method: 'POST',
      body: '{"foo":"bar"}',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  it('pass headers', async () => {
    fetchMocked.mockResolvedValue(new Response('') as unknown as FetchResponse)

    await render({
      headers: {
        foo: 'bar',
      },
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/test', {
      method: 'POST',
      body: '{}',
      headers: {
        'Content-Type': 'application/json',
        foo: 'bar',
      },
    })
  })
})
