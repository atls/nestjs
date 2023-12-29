/* eslint-disable no-promise-executor-return */

jest.mock('node-fetch')

import fetch                           from 'node-fetch'
import { Response }                    from 'node-fetch'

import { ExpressExternalRendererView } from './express-external-renderer.view'

describe('ExpressExternalRendererView', () => {
  let render: any

  beforeAll(async () => {
    const view = new ExpressExternalRendererView('/test', {
      root: `http://localhost:3000`,
    })

    render = (params = {}) => new Promise((resolve) => view.render(params, resolve))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('pass querie variables', async () => {
    fetch.mockReturnValue(Promise.resolve(new Response('')))

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
    fetch.mockReturnValue(Promise.resolve(new Response('')))

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
    fetch.mockReturnValue(Promise.resolve(new Response('')))

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
