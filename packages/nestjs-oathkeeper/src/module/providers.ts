import type { Provider }                from '@nestjs/common'

import type { OathkeeperModuleOptions } from './interfaces.js'

import { ApiApi }                       from '@ory/oathkeeper-client-fetch'
import { Configuration }                from '@ory/oathkeeper-client-fetch'

import { OathkeeperDecisionService }    from '../decision.js'
import { OathkeeperIdentityMiddleware } from '../middleware.js'
import { OATHKEEPER_API }               from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }    from './constants.js'

export const createOathkeeperOptionsProvider = (
  options: OathkeeperModuleOptions
): Array<Provider> => [
  {
    provide: OATHKEEPER_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createOathkeeperExportsProvider = (): Array<Provider> => [
  {
    provide: OATHKEEPER_API,
    useFactory: (options: OathkeeperModuleOptions) =>
      new ApiApi(new Configuration({ basePath: options.urls.api })),
    inject: [OATHKEEPER_MODULE_OPTIONS],
  },
  OathkeeperDecisionService,
  OathkeeperIdentityMiddleware,
]
