/* eslint-disable @typescript-eslint/no-empty-function */

import { Controller }                from '@nestjs/common'
import { Get }                       from '@nestjs/common'
import { UseInterceptors }           from '@nestjs/common'

import { KratosRedirectInterceptor } from '../../src/index.js'
import { Flow }                      from '../../src/index.js'
import { KratosPublicApi }           from '../../src/index.js'

@Controller('redirect')
export class RedirectController {
  constructor(private readonly kratos: KratosPublicApi) {}

  @Get('403')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  async redirect403() {
    await this.kratos.getSelfServiceLoginFlow('flow')
  }

  @Get('404')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  async redirect404() {
    await this.kratos.getSelfServiceRegistrationFlow('flow')
  }

  @Get('410')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  async redirect410() {
    await this.kratos.getSelfServiceRecoveryFlow('flow')
  }

  @Get('flow')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  redirectFlow(@Flow() flow: string) {}
}