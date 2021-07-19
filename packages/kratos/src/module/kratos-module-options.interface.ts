import { ModuleMetadata, Type } from '@nestjs/common/interfaces'

export interface KratosModuleOptions {
  public: string
  browser: string
  admin?: string
  global?: boolean
}

export interface KratosOptionsFactory {
  createKratosOptions(): Promise<KratosModuleOptions> | KratosModuleOptions
}

export interface KratosModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KratosOptionsFactory>
  useClass?: Type<KratosOptionsFactory>
  useFactory?: (...args: any[]) => Promise<KratosModuleOptions> | KratosModuleOptions
  inject?: any[]
  global?: boolean
}
