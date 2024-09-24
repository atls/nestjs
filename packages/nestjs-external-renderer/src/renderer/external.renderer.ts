import type { OnModuleInit }                from '@nestjs/common'

import { Inject }                           from '@nestjs/common'
import { Injectable }                       from '@nestjs/common'
import { HttpAdapterHost }                  from '@nestjs/core'

import { EXTERNAL_RENDERER_MODULE_OPTIONS } from '../module/index.js'
import { ExternalRendererModuleOptions }    from '../module/index.js'
import { ExpressExternalRendererView }      from './express-external-renderer.view.js'

@Injectable()
export class ExternalRenderer implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(EXTERNAL_RENDERER_MODULE_OPTIONS)
    private readonly options: ExternalRendererModuleOptions
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const instance = this.adapterHost.httpAdapter.getInstance()

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      instance.set('view', ExpressExternalRendererView)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      instance.set('views', this.options.url)

      const { render } = instance.response

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/ban-types
      instance.response.render = function renderView(view, options, callback: Function) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return render.apply(this, [
          view,
          {
            data: options,
            headers: this.req.header,
            query: this.req.query,
          },
          callback,
        ])
      }
    } else {
      throw new Error('Only express engine available')
    }
  }
}
