import type { ModuleMetadata } from '@nestjs/common/interfaces'
import type { Type }           from '@nestjs/common/interfaces'

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
  useFactory?: (...args: Array<any>) => KratosModuleOptions | Promise<KratosModuleOptions>
  inject?: Array<any>
  global?: boolean
}
