import 'reflect-metadata'

import type { INestApplication }             from '@nestjs/common'

import assert                                from 'node:assert/strict'
import { describe }                          from 'node:test'
import { it }                                from 'node:test'

import { Test }                              from '@nestjs/testing'
import request                               from 'supertest'

import { EXTERNAL_RENDERER_MODULE_OPTIONS }  from '../../src/index.js'
import { ExternalRendererIntegrationModule } from '../src/index.js'

describe('external renderer', { timeout: 30000 }, () => {
  const createApp = async (): Promise<{
    app: INestApplication
    server: Parameters<typeof request>[0]
    cleanup: () => void
  }> => {
    const testingModule = await Test.createTestingModule({
      imports: [ExternalRendererIntegrationModule],
    })
      .overrideProvider(EXTERNAL_RENDERER_MODULE_OPTIONS)
      .useValue({
        url: 'http://127.0.0.1:3000',
      })
      .compile()

    const app = testingModule.createNestApplication()

    await app.init()

    const server = app.getHttpServer() as Parameters<typeof request>[0]
    const originalFetch = globalThis.fetch

    globalThis.fetch = (async (input: URL | string, init?: RequestInit) => {
      const requestUrl = new URL(input.toString())
      const body =
        typeof init?.body === 'string'
          ? (JSON.parse(init.body) as Record<string, unknown>)
          : undefined

      const response = await request(server)
        .post(requestUrl.pathname + requestUrl.search)
        .send(body ?? {})

      return {
        text: async () => response.text,
      } as Response
    }) as typeof fetch

    return {
      app,
      server,
      cleanup: () => {
        globalThis.fetch = originalFetch
      },
    }
  }

  it(`return content`, async () => {
    const { app, server, cleanup } = await createApp()

    try {
      const response = await request(server).get('/exec/simple').expect(200)

      assert.strictEqual(response.text, 'content')
    } finally {
      cleanup()
      await app.close()
    }
  })

  it(`return param`, async () => {
    const { app, server, cleanup } = await createApp()

    try {
      const response = await request(server).get('/exec/params').expect(200)

      assert.strictEqual(response.text, 'value')
    } finally {
      cleanup()
      await app.close()
    }
  })

  it(`return param res`, async () => {
    const { app, server, cleanup } = await createApp()

    try {
      const response = await request(server).get('/exec/res-render-params').expect(200)

      assert.strictEqual(response.text, 'value')
    } finally {
      cleanup()
      await app.close()
    }
  })
})
