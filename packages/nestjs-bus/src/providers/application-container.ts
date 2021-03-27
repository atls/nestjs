import { Provider }               from '@nestjs/common'
import { BUS_SYMBOLS, BusModule } from '@node-ts/bus-core'
import { LoggerModule }           from '@node-ts/logger-core'
import { Container }              from 'inversify'

import { APPLICATION_CONTAINER }  from '../symbols'

export const applicationContainer: Provider<Container> = {
  provide: APPLICATION_CONTAINER,
  useFactory: () => {
    const container = new Container()
    container.load(new BusModule(), new LoggerModule())
    return container
  },
}
