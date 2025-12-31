import type { ExpressExternalRendererViewParams } from './express-external-renderer.view.js'

import assert                                     from 'node:assert/strict'
import { after }                                  from 'node:test'
import { before }                                 from 'node:test'
import { beforeEach }                             from 'node:test'
import { describe }                               from 'node:test'
import { it }                                     from 'node:test'
import { mock }                                   from 'node:test'

import { Response }                               from 'node-fetch'

import { ExpressExternalRendererView }            from './express-external-renderer.view.js'

type FetchResponse = Awaited<ReturnType<typeof fetch>>

describe('ExpressExternalRendererView', () => {
  let render: (params?: ExpressExternalRendererViewParams) => Promise<void>
  let fetchMock: ReturnType<typeof mock.method>

  before(async () => {
    const view = new ExpressExternalRendererView('/test', {
      root: `http://localhost:3000`,
    })

    fetchMock = mock.method(globalThis, 'fetch', async () => new Response(''))

    render = async (params: ExpressExternalRendererViewParams = {}): Promise<void> =>
      new Promise((resolve, reject) => {
        view.render(params, (error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
  })

  beforeEach(() => {
    fetchMock.mock.resetCalls()
    fetchMock.mock.mockImplementation(async () => new Response('') as unknown as FetchResponse)
  })

  after(() => {
    fetchMock.mock.restore()
  })

  it('pass querie variables', async () => {
    await render({
      query: {
        foo: 'bar',
      },
    })

    assert.equal(fetchMock.mock.callCount(), 1)
    assert.deepEqual(fetchMock.mock.calls[0].arguments, [
      'http://localhost:3000/test?foo=bar',
      {
        method: 'POST',
        body: '{}',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ])
  })

  it('pass data', async () => {
    await render({
      data: {
        foo: 'bar',
      },
    })

    assert.equal(fetchMock.mock.callCount(), 1)
    assert.deepEqual(fetchMock.mock.calls[0].arguments, [
      'http://localhost:3000/test',
      {
        method: 'POST',
        body: '{"foo":"bar"}',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ])
  })

  it('pass headers', async () => {
    await render({
      headers: {
        foo: 'bar',
      },
    })

    assert.equal(fetchMock.mock.callCount(), 1)
    assert.deepEqual(fetchMock.mock.calls[0].arguments, [
      'http://localhost:3000/test',
      {
        method: 'POST',
        body: '{}',
        headers: {
          'Content-Type': 'application/json',
          foo: 'bar',
        },
      },
    ])
  })
})
