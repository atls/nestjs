import { Controller, Get } from '@nestjs/common'
import { Whoami, Session } from '../../src'

@Controller()
export class SessionController {
  @Get('/identity/session/whoami')
  async whoami(@Whoami() identity: Session) {
    return identity
  }
}
