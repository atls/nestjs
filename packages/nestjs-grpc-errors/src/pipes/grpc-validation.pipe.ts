import type { ValidationPipeOptions }     from '@nestjs/common'

import { ValidationPipe }                 from '@nestjs/common'

import { grpcValidationExceptionFactory } from '../exception-factories/index.js'

export class GrpcValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...(options || {}),
      transform: typeof options?.transform === `undefined` ? true : options?.transform,
      exceptionFactory: grpcValidationExceptionFactory || options?.exceptionFactory,
    })
  }
}
