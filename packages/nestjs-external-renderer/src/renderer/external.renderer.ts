import type { OnModuleInit }                  from '@nestjs/common'

import type { ExternalRendererModuleOptions } from '../module/index.js'

import { Inject }                             from '@nestjs/common'
import { Injectable }                         from '@nestjs/common'
import { HttpAdapterHost }                    from '@nestjs/core'

import { EXTERNAL_RENDERER_MODULE_OPTIONS }   from '../module/index.js'
import { ExpressExternalRendererView }        from './express-external-renderer.view.js'

type ExpressResponse = {
  render: (
    view: string,
    options: unknown,
    callback: (error: unknown, html?: string) => void
  ) => unknown
  req: {
    header: Record<string, string>
    query: Record<string, unknown>
  }
}

type ExpressInstance = {
  set: (key: string, value: unknown) => void
  response: ExpressResponse
}

@Injectable()
export class ExternalRenderer implements OnModuleInit {
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @Inject(EXTERNAL_RENDERER_MODULE_OPTIONS)
    private readonly options: ExternalRendererModuleOptions
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.adapterHost.httpAdapter.getType() === 'express') {
      const instance: ExpressInstance = this.adapterHost.httpAdapter.getInstance()

      instance.set('view', ExpressExternalRendererView)
      instance.set('views', this.options.url)

      const { render } = instance.response

      instance.response.render = function renderView(
        view: string,
        options: unknown,
        callback: (error: unknown, html?: string) => void
      ): unknown {
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
