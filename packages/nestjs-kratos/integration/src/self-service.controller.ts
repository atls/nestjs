/* eslint-disable @typescript-eslint/no-empty-function */

import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'
import { HttpCode }   from '@nestjs/common'
import { Res }        from '@nestjs/common'
import { Headers }    from '@nestjs/common'
import { Response }   from 'express'

@Controller()
export class SelfServiceController {
  @Get('/self-service/login/flows')
  @HttpCode(403)
  login(): void {}

  @Get('/self-service/registration/flows')
  @HttpCode(404)
  registration(): void {}

  @Get('/self-service/recovery/flows')
  @HttpCode(410)
  recovery(): void {}

  @Get('/sessions/whoami')
  whoami(@Res() res: Response, @Headers('Cookie') cookie?: string): void {
    if (cookie) {
      res.status(200).json({
        id: 'test',
      })
    } else {
      res.status(401).send()
    }
  }
}
