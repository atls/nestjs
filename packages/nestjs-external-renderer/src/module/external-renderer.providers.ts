import { Provider }                         from '@nestjs/common'

import { ExternalRenderer }                 from '../renderer/index.js'
import { ExternalRendererModuleOptions }    from './external-renderer-module-options.interface.js'
import { EXTERNAL_RENDERER_MODULE_OPTIONS } from './external-renderer.constants.js'

export const createExternalRendererOptionsProvider = (
  options: ExternalRendererModuleOptions
): Provider[] => [
  {
    provide: EXTERNAL_RENDERER_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createExternalRendererProvider = (): Provider[] => [ExternalRenderer]

export const createExternalRendererExportsProvider = (): Provider[] => []
