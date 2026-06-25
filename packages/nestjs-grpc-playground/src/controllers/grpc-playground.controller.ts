import type { Response }                    from 'express'

import type { GrpcPlaygroundModuleOptions } from '../module/index.js'

import { Controller }                       from '@nestjs/common'
import { Inject }                           from '@nestjs/common'
import { Param }                            from '@nestjs/common'
import { Res }                              from '@nestjs/common'
import { Get }                              from '@nestjs/common'
import fetch                                from 'node-fetch'

import { GRPC_PLAYGROUND_MODULE_OPTIONS }   from '../module/index.js'

@Controller()
export class GrpcPlaygroundController {
  constructor(
    @Inject(GRPC_PLAYGROUND_MODULE_OPTIONS) private readonly options: GrpcPlaygroundModuleOptions
  ) {}

  @Get()
  async index(): Promise<string> {
    const content = await this.resolveIndexHtml()

    return content.replace(/\/_next/g, this.getJsdelivrUrl('_next'))
  }

  @Get('/_next/static/chunks/:chunk')
  async chunks(@Res() res: Response, @Param('chunk') chunk: string): Promise<void> {
    res.redirect(this.getJsdelivrUrl(`_next/static/chunks/${chunk}`))
  }

  getJsdelivrUrl(pathname: string): string {
    return `https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@${this.options.version!}/dist/${pathname}`
  }

  protected async fetchIndexHtml(): Promise<string> {
    const response = await fetch(this.getJsdelivrUrl('index.html'))

    if (!response.ok) {
      throw new Error(`Failed to load grpc playground index: ${response.status}`)
    }

    return response.text()
  }

  private async resolveIndexHtml(): Promise<string> {
    try {
      return await this.fetchIndexHtml()
    } catch {
      return this.getFallbackIndexHtml()
    }
  }

  private getFallbackIndexHtml(): string {
    return [
      '<!doctype html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8">',
      '<title>gRPC Playground</title>',
      '<style>html,body,iframe{border:0;height:100%;margin:0;width:100%;}</style>',
      '</head>',
      '<body>',
      `<iframe title="gRPC Playground" src="${this.getJsdelivrUrl('index.html')}"></iframe>`,
      '</body>',
      '</html>',
    ].join('\n')
  }
}
