import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { TinkoffService }                            from '../services'

@Injectable()
export class RequestVerifierGuard implements CanActivate {
  public constructor(private readonly tinkoff: TinkoffService) {}

  public canActivate(context: ExecutionContext): boolean {
    const { body } = context.switchToHttp().getRequest()
    const verified = this.tinkoff.security.verifyRequest(body)
    return verified
  }
}
