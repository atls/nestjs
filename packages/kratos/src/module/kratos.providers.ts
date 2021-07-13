import { Provider }              from '@nestjs/common'
import { APP_FILTER }            from '@nestjs/core'
import { Configuration }         from '../client'
import { KratosPublicApi }       from '../client'
import { KratosAdminApi }        from '../client'

import { KratosExceptionFilter } from '../filters'
import { WhoamiPipe }            from '../pipes'
import { KratosBrowserUrls }     from '../urls'
import { KratosModuleOptions }   from './kratos-module-options.interface'
import { KRATOS_MODULE_OPTIONS } from './kratos.constants'

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
  KratosBrowserUrls,
  WhoamiPipe,
]
