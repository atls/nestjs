import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'

import { Session }    from '../../src/index.js'
import { Whoami }     from '../../src/index.js'

@Controller()
export class SessionController {
  @Get('/identity/session/whoami')
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
  async whoami(@Whoami() identity: Session) {
    return identity
  }
}
