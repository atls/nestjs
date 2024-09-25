import { UseGuards }     from '@nestjs/common'
import { Controller }    from '@nestjs/common'
import { Get }           from '@nestjs/common'
import { status }        from '@grpc/grpc-js'

import { GuardedByKeto } from '../../src/index.js'
import { KetoGuard }     from '../../src/index.js'

@Controller()
export class KetoIntegrationController {
  @Get('/allowed')
  async allow(): Promise<status> {
    return status.OK
  }

  @Get('/protected-by-keto')
  @GuardedByKeto((user) => `Group:admin#members@${user}`)
  @UseGuards(KetoGuard)
  async protect(): Promise<status> {
    return status.OK
  }
}
