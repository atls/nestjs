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
    return this.resolveIndexHtml()
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
      const content = await this.fetchIndexHtml()

      return this.replaceNextAssetUrls(content)
    } catch {
      return this.getFallbackIndexHtml()
    }
  }

  private replaceNextAssetUrls(content: string): string {
    return content.replace(/\/_next/g, this.getJsdelivrUrl('_next'))
  }

  private getFallbackIndexHtml(): string {
    const indexUrl = JSON.stringify(this.getJsdelivrUrl('index.html'))
    const nextUrl = JSON.stringify(this.getJsdelivrUrl('_next'))

    return [
      '<!doctype html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8">',
      '<title>gRPC Playground</title>',
      '<style>html,body{height:100%;margin:0;}</style>',
      '</head>',
      '<body>',
      '<script>',
      `const indexUrl=${indexUrl}`,
      `const nextUrl=${nextUrl}`,
      'fetch(indexUrl)',
      '  .then((response) => {',
      '    if (!response.ok) {',
      "      throw new Error('Failed to load grpc playground index: ' + response.status)",
      '    }',
      '',
      '    return response.text()',
      '  })',
      '  .then((content) => {',
      '    document.open()',
      '    document.write(content.replace(/\\/_next/g, nextUrl))',
      '    document.close()',
      '  })',
      '  .catch(() => {',
      "    document.body.textContent = 'Unable to load gRPC Playground assets.'",
      '  })',
      '</script>',
      '</body>',
      '</html>',
    ].join('\n')
  }
}
