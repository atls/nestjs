import { Controller } from '@nestjs/common'
import { Get }        from '@nestjs/common'
import { Render }     from '@nestjs/common'
import { Res }        from '@nestjs/common'

@Controller('exec')
export class ExecController {
  @Get('/simple')
  @Render('/render/simple')
  simple(): Record<string, unknown> {
    return {}
  }

  @Get('/params')
  @Render('/render/params')
  params(): Record<string, unknown> {
    return {
      param: 'value',
    }
  }

  @Get('/res-render-params')
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  resRenderParams(@Res() res): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    res.render('/render/params', {
      param: 'value',
    })
  }
}
