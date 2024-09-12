import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'

import { Session }    from '../../src'
import { Whoami }     from '../../src'

@Controller()
export class SessionController {
  @Get('/identity/session/whoami')
  async whoami(@Whoami() identity: Session) {
    return identity
  }
}
