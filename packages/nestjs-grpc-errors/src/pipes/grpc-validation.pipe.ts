import type { ValidationPipeOptions }     from '@nestjs/common'

import { ValidationPipe }                 from '@nestjs/common'

import { grpcValidationExceptionFactory } from '../exception-factories/index.js'

export class GrpcValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    const resolvedOptions = options ?? {}
    super({
      ...resolvedOptions,
      transform: options?.transform ?? true,
      exceptionFactory: options?.exceptionFactory ?? grpcValidationExceptionFactory,
    })
  }
}
