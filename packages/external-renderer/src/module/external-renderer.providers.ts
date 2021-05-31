import { Provider }                         from '@nestjs/common'

import { ExternalRenderer }                 from '../renderer'
import { ExternalRendererModuleOptions }    from './external-renderer-module-options.interface'
import { EXTERNAL_RENDERER_MODULE_OPTIONS } from './external-renderer.constants'

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
