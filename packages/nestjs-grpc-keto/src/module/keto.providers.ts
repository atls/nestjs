import { Provider }                     from '@nestjs/common'

import { KetoWriteNativeClientService } from '../services'
import { KetoWriteClientService }       from '../services'
import { KetoReadClientService }        from '../services'
import { KetoCheckClientService }       from '../services'
import { KetoModuleOptions }            from './keto-module.interfaces'
import { KETO_WRITE_NATIVE_CLIENT }     from './keto.constants'
import { KETO_CHECK_CLIENT }            from './keto.constants'
import { KETO_WRITE_CLIENT }            from './keto.constants'
import { KETO_READ_CLIENT }             from './keto.constants'
import { KETO_MODULE_OPTIONS }          from './keto.constants'

export const createKetoOptionsProvider = (options: KetoModuleOptions): Provider[] => [
  {
    provide: KETO_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createKetoExportsProvider = (): Provider[] => [
  {
    provide: KETO_CHECK_CLIENT,
    useFactory: (options: KetoModuleOptions) => new KetoCheckClientService(options),
    inject: [KETO_MODULE_OPTIONS],
  },
  {
    provide: KETO_WRITE_NATIVE_CLIENT,
    useFactory: (options: KetoModuleOptions) => new KetoWriteNativeClientService(options),
    inject: [KETO_MODULE_OPTIONS],
  },
  {
    provide: KETO_READ_CLIENT,
    useFactory: (checkClientService: KetoCheckClientService) =>
      new KetoReadClientService(checkClientService),
    inject: [KETO_CHECK_CLIENT],
  },
  {
    provide: KETO_WRITE_CLIENT,
    useFactory: (writeNativeClientService: KetoWriteNativeClientService) =>
      new KetoWriteClientService(writeNativeClientService),
    inject: [KETO_WRITE_NATIVE_CLIENT],
  },
]
