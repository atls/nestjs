import type { ExecutionContext } from '@nestjs/common'

import { createParamDecorator }  from '@nestjs/common'

import { WhoamiPipe }            from '../pipes/index.js'

export const WhoamiCredentials = createParamDecorator((
  data: unknown,
  ctx: ExecutionContext
): [string, string] => {
  const request = ctx.switchToHttp().getRequest()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return [request.get('cookie'), request.get('authorization')]
})

export const Whoami = (): ReturnType<typeof WhoamiCredentials> => WhoamiCredentials(WhoamiPipe)
