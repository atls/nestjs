import type { InjectionToken }            from '@nestjs/common/interfaces'
import type { ModuleMetadata }            from '@nestjs/common/interfaces'
import type { OptionalFactoryDependency } from '@nestjs/common/interfaces'
import type { Type }                      from '@nestjs/common/interfaces'

import type { OathkeeperMiddlewareMode }  from '../interfaces.js'

export interface OathkeeperModuleUrlsOptions {
  api: string
}

export interface OathkeeperDecisionOptions {
  forwardedHost?: string
  forwardedProto?: string
  responseHeaders?: ReadonlyArray<string>
}

export interface OathkeeperMiddlewareOptions {
  mode?: OathkeeperMiddlewareMode
}

export interface OathkeeperModuleOptions {
  urls: OathkeeperModuleUrlsOptions
  decision?: OathkeeperDecisionOptions
  middleware?: OathkeeperMiddlewareOptions
  global?: boolean
}

export interface OathkeeperOptionsFactory {
  createOathkeeperOptions: () => OathkeeperModuleOptions | Promise<OathkeeperModuleOptions>
}

export interface OathkeeperModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<OathkeeperOptionsFactory>
  useClass?: Type<OathkeeperOptionsFactory>
  useFactory?: (
    ...args: Array<unknown>
  ) => OathkeeperModuleOptions | Promise<OathkeeperModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
  global?: boolean
}
