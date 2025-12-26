import type { ConfigurationParameters } from '@ory/keto-client'

import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'
import { Configuration }                from '@ory/keto-client'

import { KETO_MODULE_CONFIGURATION }    from '../module/index.js'

@Injectable()
export class KetoConfigurationService extends Configuration {
  constructor(
    @Inject(KETO_MODULE_CONFIGURATION) private readonly options: ConfigurationParameters
  ) {
    super(options)
  }
}
