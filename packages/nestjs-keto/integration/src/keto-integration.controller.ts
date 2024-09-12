import { UseGuards }     from '@nestjs/common'
import { Controller }    from '@nestjs/common'
import { Get }           from '@nestjs/common'

import { GuardedByKeto } from '../../src'
import { KetoGuard }     from '../../src'

@Controller()
export class KetoIntegrationController {
  @Get('/allowed')
  async allow() {
    return true
  }

  @Get('/protected-by-keto')
  @GuardedByKeto((user) => `Group:admin#members@${user}`)
  @UseGuards(KetoGuard)
  async protect() {
    return true
  }
}
