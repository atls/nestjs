import { verifyRequest }                             from '@atlantis-lab/tinkoff-api'

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class RequestVerifierGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest()
    const verified = verifyRequest(body)
    return verified
  }
}
