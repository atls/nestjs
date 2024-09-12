import type { ClassConstructor } from 'class-transformer'

import { plainToInstance }       from 'class-transformer'
import { validate }              from 'class-validator'

import { ValidationError }       from '../errors/index.js'

export class Validator {
  async transform<T>(metatype: ClassConstructor<unknown>, value: object): Promise<T> {
    return plainToInstance(metatype, value) as T
  }

  async validate<T>(valueOrObject: object, metatype?: ClassConstructor<unknown>): Promise<T> {
    const transformed = metatype ? await this.transform<T>(metatype, valueOrObject) : valueOrObject

    const errors = await validate(transformed as object)

    if (errors.length > 0) {
      throw new ValidationError(errors)
    }

    return transformed as T
  }
}
