import type { Provider }                         from '@nestjs/common'

import type { OathkeeperModuleAsyncOptions }     from './interfaces.js'
import type { OathkeeperModuleOptions }          from './interfaces.js'
import type { OathkeeperOptionsFactory }         from './interfaces.js'

import { OathkeeperDecisionService }             from '../decision.js'
import { OathkeeperIdentityMiddleware }          from '../middleware.js'
import { OATHKEEPER_DECISION_CLIENT }            from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }             from './constants.js'
import { createOathkeeperDecisionClient }        from '../client.js'
import { getOathkeeperAsyncOptionsClass }        from './options.js'
import { getOathkeeperAsyncOptionsInjectTarget } from './options.js'

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

  const injectTarget = getOathkeeperAsyncOptionsInjectTarget(options)

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

  const optionsClass = getOathkeeperAsyncOptionsClass(options)

  return [
    createOathkeeperAsyncOptionsProvider(options),
    {
      provide: optionsClass,
      useClass: optionsClass,
    },
  ]
}

export const createOathkeeperExportProviders = (): Array<Provider> => [
  {
    provide: OATHKEEPER_DECISION_CLIENT,
    useFactory: (options: OathkeeperModuleOptions) =>
      createOathkeeperDecisionClient(options.urls.api),
    inject: [OATHKEEPER_MODULE_OPTIONS],
  },
  OathkeeperDecisionService,
  OathkeeperIdentityMiddleware,
]
