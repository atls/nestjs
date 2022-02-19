import { Controller }    from '@nestjs/common'
import { Get }           from '@nestjs/common'
import { HttpCode } from '@nestjs/common'
import { Query }         from '@nestjs/common'

import { Res }    from '@nestjs/common'

import { Response }      from 'express'

@Controller()
export class SelfServiceController {
  @Get('/self-service/login/flows')
  @HttpCode(403)
  login() {}

  @Get('/self-service/registration/flows')
  @HttpCode(404)
  registration() {}

  @Get('/self-service/recovery/flows')
  @HttpCode(410)
  recovery() {}

  @Get('/sessions/whoami')
  whoami(@Res() res: Response, @Query('Authorization') authorization?: string) {
    if (authorization) {
      res.status(200).json({
        id: 'test',
      })
    } else {
      res.status(401).send()
    }
  }
}
