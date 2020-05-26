import { TinkoffPublicOptions }  from '@aunited/tinkoff-api'
import { DynamicModule, Module } from '@nestjs/common'

import { TINKOFF_API_OPTIONS }   from './tinkoff.constants'
import { TinkoffService }        from './tinkoff.service'

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
