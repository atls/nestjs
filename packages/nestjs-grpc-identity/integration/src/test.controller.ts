import { Controller }           from '@nestjs/common'
import { UseGuards }            from '@nestjs/common'
import { GrpcMethod }           from '@nestjs/microservices'

import { GrpcJwtIdentityGuard } from '../../src'
import { Subject }              from '../../src'

@Controller()
@UseGuards(GrpcJwtIdentityGuard)
export class TestController {
  @GrpcMethod('TestService', 'Test')
  test(@Subject() subject: string) {
    return {
      id: subject,
    }
  }
}
