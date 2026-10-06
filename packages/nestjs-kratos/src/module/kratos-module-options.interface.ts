import type { ModuleMetadata }            from '@nestjs/common'
import type { Type }                      from '@nestjs/common'
import type { InjectionToken }            from '@nestjs/common'
import type { OptionalFactoryDependency } from '@nestjs/common'

export interface KratosModuleOptions {
  public: string
  browser: string
  admin?: string
  global?: boolean
}

export interface KratosOptionsFactory {
  // eslint-disable-next-line @typescript-eslint/method-signature-style
  createKratosOptions(): KratosModuleOptions | Promise<KratosModuleOptions>
}

export interface KratosModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KratosOptionsFactory>
  useClass?: Type<KratosOptionsFactory>
  useFactory?: (...args: Array<unknown>) => KratosModuleOptions | Promise<KratosModuleOptions>
  inject?: Array<InjectionToken | OptionalFactoryDependency>
  global?: boolean
}
