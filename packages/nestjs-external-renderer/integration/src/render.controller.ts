import { Controller } from '@nestjs/common'
import { Body }       from '@nestjs/common'
import { Post }       from '@nestjs/common'

@Controller('render')
export class RenderController {
  @Post('simple')
  simple(): string {
    return 'content'
  }

  @Post('params')
  // @ts-expect-error unsafe method
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  params(@Body() body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return body.param
  }
}
