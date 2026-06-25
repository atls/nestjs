import type { GrpcPlaygroundModuleOptions } from '../../module/index.js'

import assert                               from 'node:assert/strict'
import { describe }                         from 'node:test'
import { it }                               from 'node:test'

import { GrpcPlaygroundController }         from '../grpc-playground.controller.js'

const options: GrpcPlaygroundModuleOptions = {
  version: '0.0.8',
  options: {
    package: [],
    protoPath: [],
  },
}

type IndexHtmlLoader = () => Promise<string>

class TestGrpcPlaygroundController extends GrpcPlaygroundController {
  constructor(private readonly indexHtmlLoader: IndexHtmlLoader) {
    super(options)
  }

  protected override async fetchIndexHtml(): Promise<string> {
    return this.indexHtmlLoader()
  }
}

describe('GrpcPlaygroundController', () => {
  it('rewrites static asset paths to jsdelivr urls', async () => {
    const target = new TestGrpcPlaygroundController(
      async () => '<script src="/_next/static/chunks/main.js"></script>'
    )

    const content = await target.index()

    assert.ok(
      content.includes(
        'https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@0.0.8/dist/_next/static/chunks/main.js'
      )
    )
  })

  it('returns rewritten fallback html when jsdelivr index is unavailable', async () => {
    const target = new TestGrpcPlaygroundController(async () => {
      throw new Error('CDN unavailable')
    })

    const content = await target.index()

    assert.equal(content.includes('<iframe'), false)
    assert.ok(
      content.includes(
        'https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@0.0.8/dist/index.html'
      )
    )
    assert.ok(
      content.includes('https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@0.0.8/dist/_next')
    )
    assert.ok(content.includes('document.write(content.replace(/\\/_next/g, nextUrl))'))
  })
})
