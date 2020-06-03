import { Tinkoff, TinkoffPublicOptions } from '@aunited/tinkoff-api'
import { Inject, Injectable }            from '@nestjs/common'

import { TINKOFF_API_OPTIONS }           from './tinkoff.constants'

@Injectable()
export class TinkoffService extends Tinkoff {
  public constructor(@Inject(TINKOFF_API_OPTIONS) options: TinkoffPublicOptions) {
    super(options)
  }
}
