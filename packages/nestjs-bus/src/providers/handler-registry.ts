import { Provider } from '@nestjs/common'
import { HandlerRegistry, BUS_SYMBOLS } from '@node-ts/bus-core'
import { Container } from 'inversify'
import { APPLICATION_CONTAINER } from '../symbols'

export const handlerRegistryProviders: Provider<HandlerRegistry>[] = [
  {
    provide: BUS_SYMBOLS.HandlerRegistry,
    useFactory: (applicationContainer: Container) => applicationContainer.get(BUS_SYMBOLS.HandlerRegistry),
    inject: [APPLICATION_CONTAINER],
  },
  {
    provide: HandlerRegistry,
    useFactory: (applicationContainer: Container) => applicationContainer.get(BUS_SYMBOLS.HandlerRegistry),
    inject: [APPLICATION_CONTAINER],
  },
]
