import { Controller }   from '@nestjs/common'
import { GrpcMethod }   from '@nestjs/microservices'

import { EchoRequest }  from '../../proto/index.js'
import { EchoResponse } from '../../proto/index.js'

@Controller()
export class EchoController {
  @GrpcMethod('EchoService', 'Echo')
  echo(request: EchoRequest): EchoResponse {
    return {
      pong: request.ping,
    }
  }
}
