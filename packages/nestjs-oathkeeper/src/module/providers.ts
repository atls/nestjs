import type { Provider }                     from '@nestjs/common'

import type { OathkeeperModuleAsyncOptions } from './interfaces.js'
import type { OathkeeperModuleOptions }      from './interfaces.js'
import type { OathkeeperOptionsFactory }     from './interfaces.js'

import { ApiApi }                            from '@ory/oathkeeper-client-fetch'
import { Configuration }                     from '@ory/oathkeeper-client-fetch'

import { OathkeeperDecisionService }         from '../decision.js'
import { OathkeeperIdentityMiddleware }      from '../middleware.js'
import { OATHKEEPER_API }                    from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }         from './constants.js'

export const createOathkeeperOptionsProvider = (options: OathkeeperModuleOptions): Provider => ({
  provide: OATHKEEPER_MODULE_OPTIONS,
  useValue: options,
})

const createOathkeeperAsyncOptionsProvider = (options: OathkeeperModuleAsyncOptions): Provider => {
  if (options.useFactory) {
    return {
      provide: OATHKEEPER_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    }
  }

  const injectTarget = options.useExisting ?? options.useClass

  if (!injectTarget) {
    throw new Error('OathkeeperModule requires useExisting, useClass, or useFactory')
  }

  return {
    provide: OATHKEEPER_MODULE_OPTIONS,
    useFactory: async (optionsFactory: OathkeeperOptionsFactory) =>
      optionsFactory.createOathkeeperOptions(),
    inject: [injectTarget],
  }
}

export const createOathkeeperAsyncOptionsProviders = (
  options: OathkeeperModuleAsyncOptions
): Array<Provider> => {
  if (options.useExisting || options.useFactory) {
    return [createOathkeeperAsyncOptionsProvider(options)]
  }

  if (!options.useClass) {
    throw new Error('OathkeeperModule requires useClass when useExisting/useFactory not provided')
  }

  return [
    createOathkeeperAsyncOptionsProvider(options),
    {
      provide: options.useClass,
      useClass: options.useClass,
    },
  ]
}

export const createOathkeeperExportProviders = (): Array<Provider> => [
  {
    provide: OATHKEEPER_API,
    useFactory: (options: OathkeeperModuleOptions) =>
      new ApiApi(new Configuration({ basePath: options.urls.api })),
    inject: [OATHKEEPER_MODULE_OPTIONS],
  },
  OathkeeperDecisionService,
  OathkeeperIdentityMiddleware,
]
