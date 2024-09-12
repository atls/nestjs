import type { DynamicModule } from '@nestjs/common'

import { Module }             from '@nestjs/common'

import { Validator }          from '../validator/index.js'

@Module({})
export class ValidationModule {
  static register(): DynamicModule {
    return {
      module: ValidationModule,
      providers: [
        {
          provide: Validator,
          useClass: Validator,
        },
      ],
      exports: [
        {
          provide: Validator,
          useClass: Validator,
        },
      ],
    }
  }
}
