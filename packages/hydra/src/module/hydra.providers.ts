import { Provider }             from '@nestjs/common'
import { Configuration }        from '../client'
import { HydraAdminApi }        from '../client'

import { HydraModuleOptions }   from './hydra-module-options.interface'
import { HYDRA_MODULE_OPTIONS } from './hydra.constants'

export const createHydraOptionsProvider = (options: HydraModuleOptions): Provider[] => [
  {
    provide: HYDRA_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createHydraProvider = (): Provider[] => []

export const createHydraExportsProvider = (): Provider[] => [
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
