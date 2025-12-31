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
    const response = await fetch(this.getJsdelivrUrl('index.html'))
    const content = await response.text()

    return content.replace(/\/_next/g, this.getJsdelivrUrl('_next'))
  }

  @Get('/_next/static/chunks/:chunk')
  async chunks(@Res() res: Response, @Param('chunk') chunk: string): Promise<void> {
    res.redirect(this.getJsdelivrUrl(`_next/static/chunks/${chunk}`))
  }

  getJsdelivrUrl(pathname: string): string {
    return `https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@${this.options.version!}/dist/${pathname}`
  }
}
