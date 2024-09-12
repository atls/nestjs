import { Inject }                    from '@nestjs/common'
import { Injectable }                from '@nestjs/common'
import { RelationshipApi }           from '@ory/keto-client'
import { Configuration }             from '@ory/keto-client'

import { KETO_MODULE_CONFIGURATION } from '../module/index.js'

@Injectable()
export class KetoRelationsService extends RelationshipApi {
  constructor(@Inject(KETO_MODULE_CONFIGURATION) private readonly options: Configuration) {
    super(options)
  }
}
