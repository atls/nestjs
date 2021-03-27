import { Provider } from '@nestjs/common'
import { Container } from 'inversify'
import { BusModule, BUS_SYMBOLS } from '@node-ts/bus-core'
import { LoggerModule } from '@node-ts/logger-core'
import { APPLICATION_CONTAINER } from '../symbols'

export const applicationContainer: Provider<Container> = {
  provide: APPLICATION_CONTAINER,
  useFactory: () => {
    const container = new Container()
    container.load(new BusModule(), new LoggerModule())
    return container
  },
}
