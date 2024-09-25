import { Controller }           from '@nestjs/common'
import { UseGuards }            from '@nestjs/common'
import { GrpcMethod }           from '@nestjs/microservices'

import { GrpcJwtIdentityGuard } from '../../src/index.js'
import { Subject }              from '../../src/index.js'

@Controller()
@UseGuards(GrpcJwtIdentityGuard)
export class TestController {
  @GrpcMethod('TestService', 'Test')
  test(@Subject() subject: string): { id: string } {
    return {
      id: subject,
    }
  }
}
