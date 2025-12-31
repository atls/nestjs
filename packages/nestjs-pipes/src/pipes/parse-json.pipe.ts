import type { PipeTransform }       from '@nestjs/common'
import type { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util.js'

import { Injectable }               from '@nestjs/common'
import { Optional }                 from '@nestjs/common'
import { HttpStatus }               from '@nestjs/common'
import { HttpErrorByCode }          from '@nestjs/common/utils/http-error-by-code.util.js'
import { isNil }                    from '@nestjs/common/utils/shared.utils.js'

export interface ParseJsonPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode
  exceptionFactory?: (error: string) => unknown
  optional?: boolean
}

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  protected exceptionFactory: (error: string) => unknown

  constructor(@Optional() protected readonly options: ParseJsonPipeOptions = {}) {
    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } = options

    this.exceptionFactory =
      exceptionFactory || ((error): unknown => new HttpErrorByCode[errorHttpStatusCode](error))
  }

  transform(value: unknown): unknown {
    if (isNil(value) && this.options.optional) {
      return value
    }

    try {
      return JSON.parse(value as string)
    } catch {
      throw this.exceptionFactory('Validation failed (invalid json string)')
    }
  }
}
