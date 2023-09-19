import { DynamicModule }   from '@nestjs/common'
import { Module }          from '@nestjs/common'
import { EnginesApi }      from '@ory/keto-client'

import { RESOURCES_SCOPE } from './constants'
import { ResourceService } from './services'

@Module({})
export class KetoModule {
  static forRoot(options: any = {}): DynamicModule {
    const enginesApiProvider = {
      provide: EnginesApi,
      useFactory: () =>
        new EnginesApi((options.url || process.env.KETO_ENGINES_URL || '').replace(/\/+$/, '')),
    }

    const resourcesScopeProvider = {
      provide: RESOURCES_SCOPE,
      useValue: options.scope,
    }

    const resourceServiceProvider = {
      provide: ResourceService,
      useClass: ResourceService,
    }

    return {
      module: KetoModule,
      providers: [enginesApiProvider, resourceServiceProvider, resourcesScopeProvider],
      exports: [enginesApiProvider, resourceServiceProvider],
      global: true,
    }
  }
}
