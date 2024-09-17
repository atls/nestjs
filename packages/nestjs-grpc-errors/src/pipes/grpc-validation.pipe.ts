import { ValidationPipe }                 from '@nestjs/common'

import { grpcValidationExceptionFactory } from '../exception-factories/index.js'

export class GrpcValidationPipe extends ValidationPipe {
  // @ts-ignore
  constructor(options?) {
    super({
      ...(options || {}),
      transform: typeof options?.transform === `undefined` ? true : options?.transform,
      exceptionFactory: grpcValidationExceptionFactory || options?.exceptionFactory,
    })
  }
}
