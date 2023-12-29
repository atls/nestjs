import { UseGuards }     from '@nestjs/common'
import { Controller }    from '@nestjs/common'
import { Get }           from '@nestjs/common'
import { status }        from '@grpc/grpc-js'

import { GuardedByKeto } from '../../src'
import { KetoGuard }     from '../../src'

@Controller()
export class KetoIntegrationController {
  @Get('/allowed')
  async allow() {
    return status.OK
  }

  @Get('/protected-by-keto')
  @GuardedByKeto((user) => `Group:admin#members@${user}`)
  @UseGuards(KetoGuard)
  async protect() {
    return status.OK
  }
}
