import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'
import { Render }     from '@nestjs/common'
import { Res }        from '@nestjs/common'

@Controller('exec')
export class ExecController {
  @Get('/simple')
  @Render('/render/simple')
  simple() {
    return {}
  }

  @Get('/params')
  @Render('/render/params')
  params() {
    return {
      param: 'value',
    }
  }

  @Get('/res-render-params')
  resRenderParams(@Res() res) {
    return res.render('/render/params', {
      param: 'value',
    })
  }
}
