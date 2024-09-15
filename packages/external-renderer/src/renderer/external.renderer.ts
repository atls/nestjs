import { Inject }                           from '@nestjs/common'
import { OnModuleInit }                     from '@nestjs/common'
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

  async onModuleInit() {
    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const instance = this.adapterHost.httpAdapter.getInstance()

      instance.set('view', ExpressExternalRendererView)
      instance.set('views', this.options.url)

      const { render } = instance.response

      // @ts-ignore eslint-disable-next-line func-names
      instance.response.render = function (view, options, callback: Function) {
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
