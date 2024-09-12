import { ValidationPipe }                 from '@nestjs/common'

import { grpcValidationExceptionFactory } from '../exception-factories'

export class GrpcValidationPipe extends ValidationPipe {
  constructor(options?) {
    super({
      ...(options || {}),
      transform: typeof options?.transform === `undefined` ? true : options?.transform,
      exceptionFactory: grpcValidationExceptionFactory || options?.exceptionFactory,
    })
  }
}
