import { Provider } from '@nestjs/common'
import { BUS_SYMBOLS, ServiceBus } from '@node-ts/bus-core'
import { Container } from 'inversify'
import { APPLICATION_CONTAINER } from '../symbols'

export const busService: Provider<ServiceBus> = {
  provide: BUS_SYMBOLS.Bus,
  useFactory: (applicationContainer: Container) => applicationContainer.get(BUS_SYMBOLS.Bus),
  inject: [APPLICATION_CONTAINER],
}
