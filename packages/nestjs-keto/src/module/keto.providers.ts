import { Provider }                  from '@nestjs/common'

import { KetoConfigurationService }  from '../services'
import { KetoPermissionsService }    from '../services'
import { KetoWriteClientService }    from '../services'
import { KetoReadClientService }     from '../services'
import { KetoRelationsService }      from '../services'
import { KetoModuleOptions }         from './keto-module.interfaces'
import { KETO_RELATIONS }            from './keto.constants'
import { KETO_PERMISSIONS }          from './keto.constants'
import { KETO_WRITE_CLIENT }         from './keto.constants'
import { KETO_READ_CLIENT }          from './keto.constants'
import { KETO_MODULE_CONFIGURATION } from './keto.constants'

export const createKetoConfigurationProvider = (options: KetoModuleOptions): Provider[] => [
  {
    provide: KETO_MODULE_CONFIGURATION,
    useFactory: () => new KetoConfigurationService(options),
  },
]

export const createKetoExportsProvider = (): Provider[] => [
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
