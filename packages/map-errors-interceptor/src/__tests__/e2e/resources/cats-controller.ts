import { Body, Controller, Post, UseInterceptors } from '@nestjs/common'

import { MapValidationErrorsInterceptor }          from '../../../index'
import { CreateCatDto }                            from './create-cat-dto'

@Controller('cat')
@UseInterceptors(MapValidationErrorsInterceptor)
export class CatsController {
  @Post()
  public createCat(@Body() cat: CreateCatDto) {
    return {
      success: true,
    }
  }
}
