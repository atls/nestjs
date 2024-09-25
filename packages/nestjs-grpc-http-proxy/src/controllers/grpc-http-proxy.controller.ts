// @ts-nocheck
import { ErrorStatus }           from '@atls/grpc-error-status'
import { Controller }            from '@nestjs/common'
import { Body }                  from '@nestjs/common'
import { Post }                  from '@nestjs/common'
import { HttpCode }              from '@nestjs/common'
import { Param }                 from '@nestjs/common'
import { Header }                from '@nestjs/common'
import { Req }                   from '@nestjs/common'
import { Res }                   from '@nestjs/common'
import { Request }               from 'express'
import { Response }              from 'express'
import BJSON                     from 'buffer-json'

import { AuthenticationService } from '../authenticators/index.js'
import { ProtoRegistry }         from '../proto/index.js'

@Controller('grpc-proxy')
export class GrpcHttpProxyController {
  constructor(
    private readonly protoRegistry: ProtoRegistry,
    private readonly authenticator: AuthenticationService
  ) {}

  @HttpCode(200)
  @Post('/:service/:method')
  @Header('Content-Type', 'application/json')
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  async call(
    // @ts-expect-error
    @Param('service') service,
    // @ts-expect-error
    @Param('method') method,
    // @ts-expect-error
    @Body() body,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
    try {
      const authorization = await this.authenticator.authenticate(req, res)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const data = await this.protoRegistry.getClient(service).call(method, body, { authorization })

      res.send(BJSON.stringify(data))
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      res.send(BJSON.stringify(ErrorStatus.fromServiceError(error as any).toObject()))
    }
  }
}
