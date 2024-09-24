import type { Provider }             from '@nestjs/common'

import type { KetoModuleOptions }    from './keto-module.interfaces.js'

import { KetoConfigurationService }  from '../services/index.js'
import { KetoPermissionsService }    from '../services/index.js'
import { KetoWriteClientService }    from '../services/index.js'
import { KetoReadClientService }     from '../services/index.js'
import { KetoRelationsService }      from '../services/index.js'
import { KETO_RELATIONS }            from './keto.constants.js'
import { KETO_PERMISSIONS }          from './keto.constants.js'
import { KETO_WRITE_CLIENT }         from './keto.constants.js'
import { KETO_READ_CLIENT }          from './keto.constants.js'
import { KETO_MODULE_CONFIGURATION } from './keto.constants.js'

export const createKetoConfigurationProvider = (options: KetoModuleOptions): Array<Provider> => [
  {
    provide: KETO_MODULE_CONFIGURATION,
    useFactory: () => new KetoConfigurationService(options),
  },
]

export const createKetoExportsProvider = (): Array<Provider> => [
  {
    provide: KETO_PERMISSIONS,
    useFactory: (options: KetoConfigurationService) => new KetoPermissionsService(options),
    inject: [KETO_MODULE_CONFIGURATION],
  },
  {
    provide: KETO_RELATIONS,
    useFactory: (options: KetoConfigurationService) => new KetoRelationsService(options),
    inject: [KETO_MODULE_CONFIGURATION],
  },
  {
    provide: KETO_READ_CLIENT,
    useFactory: (permissionsService: KetoPermissionsService) =>
      new KetoReadClientService(permissionsService),
    inject: [KETO_PERMISSIONS],
  },
  {
    provide: KETO_WRITE_CLIENT,
    useFactory: (relationshipsService: KetoRelationsService) =>
      new KetoWriteClientService(relationshipsService),
    inject: [KETO_RELATIONS],
  },
]
