import { IsString, MaxLength, MinLength }           from 'class-validator'

import { MAX_CAT_NAME_LENGTH, MIN_CAT_NAME_LENGTH } from './constants'

export class CreateCatDto {
  @IsString()
  @MinLength(MIN_CAT_NAME_LENGTH)
  @MaxLength(MAX_CAT_NAME_LENGTH)
  name: string
}
