import { Provider } from '@nestjs/common'
import { BUS_SYMBOLS, ApplicationBootstrap } from '@node-ts/bus-core'
import { Container } from 'inversify'
import { APPLICATION_CONTAINER } from '../symbols'

export const applicationBootstrap: Provider<ApplicationBootstrap> = {
  provide: BUS_SYMBOLS.ApplicationBootstrap,
  useFactory: (applicationContainer: Container) => applicationContainer.get(BUS_SYMBOLS.ApplicationBootstrap),
  inject: [APPLICATION_CONTAINER],
}
