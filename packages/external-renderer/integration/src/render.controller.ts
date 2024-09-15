import { Controller } from '@nestjs/common'
import { Body }       from '@nestjs/common'
import { Post }       from '@nestjs/common'

@Controller('render')
export class RenderController {
  @Post('simple')
  simple() {
    return 'content'
  }

  @Post('params')
  // @ts-ignore
  params(@Body() body) {
    return body.param
  }
}
