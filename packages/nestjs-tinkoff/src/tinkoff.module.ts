import { TinkoffPublicOptions }  from '@atlantis-lab/tinkoff-api'

import { DynamicModule, Module } from '@nestjs/common'

import { TinkoffService }        from './services'
import { TINKOFF_API_OPTIONS }   from './tinkoff.constants'

@Module({
  providers: [TinkoffService],
  exports: [TinkoffService],
})
export class TinkoffAPIModule {
  public static register(options: TinkoffPublicOptions): DynamicModule {
    return {
      module: TinkoffAPIModule,
      providers: [{ provide: TINKOFF_API_OPTIONS, useValue: options }],
    }
  }
}
