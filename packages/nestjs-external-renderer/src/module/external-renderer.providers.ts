import type { Provider }                      from '@nestjs/common'

import type { ExternalRendererModuleOptions } from './external-renderer-module-options.interface.js'

import { ExternalRenderer }                   from '../renderer/index.js'
import { EXTERNAL_RENDERER_MODULE_OPTIONS }   from './external-renderer.constants.js'

export const createExternalRendererOptionsProvider = (
  options: ExternalRendererModuleOptions
): Array<Provider> => [
  {
    provide: EXTERNAL_RENDERER_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createExternalRendererProvider = (): Array<Provider> => [ExternalRenderer]

export const createExternalRendererExportsProvider = (): Array<Provider> => []
