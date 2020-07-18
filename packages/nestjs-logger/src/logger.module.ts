import { DynamicModule, Global, Module } from '@nestjs/common'

import { Logger }                        from './logger'
import { createLoggerProviders }         from './logger.providers'

@Global()
@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const providers = createLoggerProviders()
    return {
      module: LoggerModule,
      providers: [...providers, Logger],
      exports: [Logger],
    }
  }
}
