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
  async redirect403(): Promise<void> {
    await this.kratos.getLoginFlow({ id: 'flow' })
  }

  @Get('404')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  async redirect404(): Promise<void> {
    await this.kratos.getRegistrationFlow({ id: 'flow' })
  }

  @Get('410')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  async redirect410(): Promise<void> {
    await this.kratos.getRecoveryFlow({ id: 'flow' })
  }

  @Get('flow')
  @UseInterceptors(new KratosRedirectInterceptor('login'))
  redirectFlow(@Flow() flow: string): void {}
}
