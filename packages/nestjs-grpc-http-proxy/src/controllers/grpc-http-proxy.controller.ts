import type { ServiceError }     from '@grpc/grpc-js'
import type { Request }          from 'express'
import type { Response }         from 'express'

import { ErrorStatus }           from '@atls/grpc-error-status'
import { Controller }            from '@nestjs/common'
import { Body }                  from '@nestjs/common'
import { Post }                  from '@nestjs/common'
import { HttpCode }              from '@nestjs/common'
import { Param }                 from '@nestjs/common'
import { Header }                from '@nestjs/common'
import { Req }                   from '@nestjs/common'
import { Res }                   from '@nestjs/common'
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
  async call(
    @Param('service') service: string,
    @Param('method') method: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    try {
      const authorization = await this.authenticator.authenticate(req, res)

      const data = await this.protoRegistry.getClient(service).call(method, body, { authorization })

      res.send(BJSON.stringify(data))
    } catch (error) {
      res.send(BJSON.stringify(ErrorStatus.fromServiceError(error as ServiceError).toObject()))
    }
  }
}
