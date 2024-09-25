import type { ExternalRendererOptionsFactory } from '../module/index.js'
import type { ExternalRendererModuleOptions }  from '../module/index.js'

export class ExternalRendererEnvConfig implements ExternalRendererOptionsFactory {
  createExternalRendererOptions(): ExternalRendererModuleOptions {
    if (!process.env.EXTERNAL_RENDERER_URL) {
      throw new Error('EXTERNAL_RENDERER_URL configuration variable required')
    }

    return {
      url: process.env.EXTERNAL_RENDERER_URL,
    }
  }
}
