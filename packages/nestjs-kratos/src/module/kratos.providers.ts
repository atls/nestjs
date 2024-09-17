import { Provider }              from '@nestjs/common'
import { APP_FILTER }            from '@nestjs/core'

import { Configuration }         from '../client/index.js'
import { KratosPublicApi }       from '../client/index.js'
import { KratosAdminApi }        from '../client/index.js'
import { KratosExceptionFilter } from '../filters/index.js'
import { WhoamiPipe }            from '../pipes/index.js'
import { KratosBrowserUrls }     from '../urls/index.js'
import { KratosModuleOptions }   from './kratos-module-options.interface.js'
import { KRATOS_BROWSER_URLS }   from './kratos.constants.js'
import { KRATOS_MODULE_OPTIONS } from './kratos.constants.js'

export const createKratosOptionsProvider = (options: KratosModuleOptions): Provider[] => [
  {
    provide: KRATOS_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createKratosProvider = (): Provider[] => [
  {
    provide: APP_FILTER,
    useClass: KratosExceptionFilter,
  },
]

export const createKratosExportsProvider = (): Provider[] => [
  {
    provide: KratosPublicApi,
    useFactory: (config: KratosModuleOptions) =>
      new KratosPublicApi(new Configuration({ basePath: config.public })),
    inject: [KRATOS_MODULE_OPTIONS],
  },
  {
    provide: KratosAdminApi,
    useFactory: (config: KratosModuleOptions) =>
      new KratosAdminApi(
        new Configuration({ basePath: config.admin || 'http://kratos-admin:4434' })
      ),
    inject: [KRATOS_MODULE_OPTIONS],
  },
  {
    provide: KRATOS_BROWSER_URLS,
    useClass: KratosBrowserUrls,
  },
  WhoamiPipe,
]
