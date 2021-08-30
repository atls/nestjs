import { Controller }   from '@nestjs/common'
import { GrpcMethod }   from '@nestjs/microservices'

import { EchoRequest }  from '../../proto'
import { EchoResponse } from '../../proto'

@Controller()
export class EchoController {
  @GrpcMethod('EchoService', 'Echo')
  echo(request: EchoRequest): EchoResponse {
    return {
      pong: request.ping,
    }
  }
}
