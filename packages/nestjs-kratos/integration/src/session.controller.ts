import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'

import { Session }    from '../../src/index.js'
import { Whoami }     from '../../src/index.js'

@Controller()
export class SessionController {
  @Get('/identity/session/whoami')
  async whoami(@Whoami() identity: Session) {
    return identity
  }
}
