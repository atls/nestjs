import type { Provider }           from '@nestjs/common'

import type { HydraModuleOptions } from './hydra-module-options.interface.js'

import { Configuration }           from '../client/index.js'
import { HydraAdminApi }           from '../client/index.js'
import { HYDRA_MODULE_OPTIONS }    from './hydra.constants.js'

export const createHydraOptionsProvider = (options: HydraModuleOptions): Array<Provider> => [
  {
    provide: HYDRA_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createHydraProvider = (): Array<Provider> => []

export const createHydraExportsProvider = (): Array<Provider> => [
  {
    provide: HydraAdminApi,

    useFactory: (config: HydraModuleOptions) => {
      const baseOptions = config.tls?.termination
        ? { headers: { 'X-Forwarded-Proto': 'https' } }
        : {}

      return new HydraAdminApi(new Configuration({ basePath: config.urls.admin, baseOptions }))
    },
    inject: [HYDRA_MODULE_OPTIONS],
  },
]
