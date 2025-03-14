import type { DynamicModule }                   from '@nestjs/common'

import type { MikroORMConfigOptions }           from './mikro-orm-config.module.interfaces.js'

import { Module }                               from '@nestjs/common'

import { MIKRO_ORM_CONFIG_MODULE_OPTIONS }      from './mikro-orm-config.module.constants.js'
import { MIKRO_ORM_CONFIG_MODULE_OPTIONS_HOST } from './mikro-orm-config.module.constants.js'
import { MIKRO_ORM_CONFIG_MODULE_OPTIONS_PORT } from './mikro-orm-config.module.constants.js'
import { MikroORMConfig }                       from './mikro-orm.config.js'

@Module({})
export class MikroORMConfigModule {
  static register(options: MikroORMConfigOptions): DynamicModule {
    return {
      module: MikroORMConfigModule,
      providers: [
        MikroORMConfig,
        {
          provide: MIKRO_ORM_CONFIG_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: MIKRO_ORM_CONFIG_MODULE_OPTIONS_PORT,
          useValue: options.port,
        },
        {
          provide: MIKRO_ORM_CONFIG_MODULE_OPTIONS_HOST,
          useValue: options.host,
        },
      ],
      exports: [MikroORMConfig],
    }
  }
}
