import { ExternalRendererOptionsFactory } from '../module'
import { ExternalRendererModuleOptions }  from '../module'

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
