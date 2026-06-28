import type { Type }                         from '@nestjs/common/interfaces'

import type { OathkeeperModuleAsyncOptions } from './interfaces.js'
import type { OathkeeperOptionsFactory }     from './interfaces.js'

import { OathkeeperErrorMessage }            from '../errors/index.js'
import { OathkeeperModuleOptionsError }      from '../errors/index.js'

export const getOathkeeperAsyncOptionsClass = (
  options: OathkeeperModuleAsyncOptions
): Type<OathkeeperOptionsFactory> => {
  if (!options.useClass) {
    throw new OathkeeperModuleOptionsError(
      OathkeeperErrorMessage.MODULE_ASYNC_OPTIONS_CLASS_REQUIRED
    )
  }

  return options.useClass
}

export const getOathkeeperAsyncOptionsInjectTarget = (
  options: OathkeeperModuleAsyncOptions
): Type<OathkeeperOptionsFactory> => {
  const injectTarget = options.useExisting ?? options.useClass

  if (!injectTarget) {
    throw new OathkeeperModuleOptionsError(OathkeeperErrorMessage.MODULE_ASYNC_OPTIONS_REQUIRED)
  }

  return injectTarget
}
