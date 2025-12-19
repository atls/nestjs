import type { DynamicModule }    from '@nestjs/common'

import { Module }                from '@nestjs/common'
import { fastHashCode as hash }  from 'fast-hash-code'

import { MicroservisesRegistry } from '../registry/index.js'

@Module({})
export class MicroservisesRegistryModule {
  static register(): DynamicModule {
    return {
      global: true,
      module: MicroservisesRegistryModule,
      providers: [
        {
          provide: MicroservisesRegistry,
          useValue: MicroservisesRegistry,
        },
      ],
      exports: [
        {
          provide: MicroservisesRegistry,
          useValue: MicroservisesRegistry,
        },
      ],
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static connect(options: any): DynamicModule {
    return {
      module: MicroservisesRegistryModule,
      providers: [
        {
          provide: String(hash(JSON.stringify(options))),
          useFactory: (registry: typeof MicroservisesRegistry): void => {
            registry.add(options)
          },
          inject: [MicroservisesRegistry],
        },
      ],
    }
  }
}
