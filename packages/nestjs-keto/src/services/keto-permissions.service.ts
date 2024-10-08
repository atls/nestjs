import { Inject }                    from '@nestjs/common'
import { Injectable }                from '@nestjs/common'
import { PermissionApi }             from '@ory/keto-client'

import { KETO_MODULE_CONFIGURATION } from '../module/index.js'
import { KetoConfigurationService }  from './keto-configuration.service.js'

@Injectable()
export class KetoPermissionsService extends PermissionApi {
  constructor(@Inject(KETO_MODULE_CONFIGURATION) readonly configuration: KetoConfigurationService) {
    super(configuration)
  }
}
