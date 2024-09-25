import { UseGuards }     from '@nestjs/common'
import { Controller }    from '@nestjs/common'
import { Get }           from '@nestjs/common'

import { GuardedByKeto } from '../../src/index.js'
import { KetoGuard }     from '../../src/index.js'

@Controller()
export class KetoIntegrationController {
  @Get('/allowed')
  async allow(): Promise<boolean> {
    return true
  }

  @Get('/protected-by-keto')
  @GuardedByKeto((user) => `Group:admin#members@${user}`)
  @UseGuards(KetoGuard)
  async protect(): Promise<boolean> {
    return true
  }
}
