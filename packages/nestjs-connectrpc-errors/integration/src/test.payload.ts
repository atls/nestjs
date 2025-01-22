/* eslint-disable max-classes-per-file */

import { Type }           from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { IsEmail }        from 'class-validator'

export class TestNestedPayload {
  @IsEmail()
  id!: string
}

export class TestPayload {
  @IsEmail()
  id!: string

  @ValidateNested()
  @Type(() => TestNestedPayload)
  child!: TestNestedPayload
}
