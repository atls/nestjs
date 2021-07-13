import { ExecutionContext }     from '@nestjs/common'
import { createParamDecorator } from '@nestjs/common'

import { WhoamiPipe }           from '../pipes'

export const WhoamiCredentials = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  return [request.get('cookie'), request.get('authorization')]
})

export const Whoami = () => WhoamiCredentials(WhoamiPipe)
