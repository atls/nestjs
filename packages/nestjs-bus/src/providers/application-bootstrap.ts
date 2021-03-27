import { Provider }                          from '@nestjs/common'
import { ApplicationBootstrap, BUS_SYMBOLS } from '@node-ts/bus-core'
import { Container }                         from 'inversify'

import { APPLICATION_CONTAINER }             from '../symbols'

export const applicationBootstrapProviders: Provider<ApplicationBootstrap>[] = [
  {
    provide: BUS_SYMBOLS.ApplicationBootstrap,
    useFactory: (applicationContainer: Container) =>
      applicationContainer.get(BUS_SYMBOLS.ApplicationBootstrap),
    inject: [APPLICATION_CONTAINER],
  },
  {
    provide: ApplicationBootstrap,
    useFactory: (applicationContainer: Container) =>
      applicationContainer.get(BUS_SYMBOLS.ApplicationBootstrap),
    inject: [APPLICATION_CONTAINER],
  },
]
