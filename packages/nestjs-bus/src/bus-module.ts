import { DynamicModule, Module }           from '@nestjs/common'
import { BusModule as NodeTSBusModule }    from '@node-ts/bus-core'
import {
  BUS_RABBITMQ_SYMBOLS,
  BusRabbitMqModule,
  RabbitMqTransportConfiguration,
} from '@node-ts/bus-rabbitmq'

import { BusMemoryModule }                 from './bus-memory-module'
import { BusRabbitMQModule }               from './bus-rabbitmq-module'
import { Transport }                       from './enums'
import { BusModuleOptions }                from './interfaces'
import { BUS_RABBITMQ_CONFIGURATION }      from './symbols'
import { busRabbitMQConfigurationFactory } from './factory'

@Module({})
export class BusModule {
  public static forRoot = (options: BusModuleOptions): DynamicModule => {
    switch (options.transport) {
      case Transport.Memory:
        return BusModule.forMemory()
      case Transport.RabbitMQ:
        return BusModule.forRabbitMQ(options.configuration)
    }
  }

  private static forMemory = (): DynamicModule => {
    const module: DynamicModule = {
      module: BusModule,
      imports: [BusMemoryModule],
      providers: [],
    }

    return module
  }

  private static forRabbitMQ = (configuration: RabbitMqTransportConfiguration): DynamicModule => {
    const busRabbitMQConfiguration = busRabbitMQConfigurationFactory(configuration)

    const module: DynamicModule = {
      module: BusModule,
      imports: [BusRabbitMQModule],
      providers: [busRabbitMQConfiguration],
    }

    return module
  }
}
