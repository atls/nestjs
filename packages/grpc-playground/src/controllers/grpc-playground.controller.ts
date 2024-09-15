import { Controller }                     from '@nestjs/common'
import { Inject }                         from '@nestjs/common'
import { Param }                          from '@nestjs/common'
import { Res }                            from '@nestjs/common'
import { Get }                            from '@nestjs/common'
import fetch                              from 'node-fetch'

import { GRPC_PLAYGROUND_MODULE_OPTIONS } from '../module/index.js'
import { GrpcPlaygroundModuleOptions }    from '../module/index.js'

@Controller()
export class GrpcPlaygroundController {
  constructor(
    @Inject(GRPC_PLAYGROUND_MODULE_OPTIONS) private readonly options: GrpcPlaygroundModuleOptions
  ) {}

  getJsdelivrUrl(pathname: string) {
    return `https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app@${this.options.version}/dist/${pathname}`
  }

  @Get()
  async index() {
    const response = await fetch(this.getJsdelivrUrl('index.html'))
    const content = await response.text()

    return content.replace(/\/_next/g, this.getJsdelivrUrl('_next'))
  }

  @Get('/_next/static/chunks/:chunk')
  // @ts-ignore
  async chunks(@Res() res, @Param('chunk') chunk: string) {
    res.redirect(this.getJsdelivrUrl(`_next/static/chunks/${chunk}`))
  }
}
