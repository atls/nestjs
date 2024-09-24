import { ValidationPipe }                 from '@nestjs/common'

import { grpcValidationExceptionFactory } from '../exception-factories/index.js'

export class GrpcValidationPipe extends ValidationPipe {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(options?) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super({
      ...(options || {}),
      transform: typeof options?.transform === `undefined` ? true : options?.transform,
      exceptionFactory: grpcValidationExceptionFactory || options?.exceptionFactory,
    })
  }
}
