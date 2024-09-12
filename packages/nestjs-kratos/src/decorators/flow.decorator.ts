import { ExecutionContext }            from '@nestjs/common'
import { createParamDecorator }        from '@nestjs/common'

import { KratosFlowRequiredException } from '../exceptions/index.js'

export const Flow = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  if (!request.query.flow) {
    throw new KratosFlowRequiredException()
  }

  return request.query.flow
})
