/* eslint-disable max-classes-per-file */

import { Type }           from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { IsEmail }        from 'class-validator'

export class TestNestedDto {
  @IsEmail()
  id!: string
}

export class TestDto {
  @IsEmail()
  id!: string

  @ValidateNested()
  @Type(() => TestNestedDto)
  child!: TestNestedDto
}
