import { Controller, Post } from '@nestjs/common'
import { Body }             from '@nestjs/common'

@Controller('render')
export class RenderController {
  @Post('simple')
  simple() {
    return 'content'
  }

  @Post('params')
  params(@Body() body) {
    return body.param
  }
}
