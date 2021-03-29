import { DynamicModule, Module }           from '@nestjs/common'
import { RabbitMqTransportConfiguration }  from '@node-ts/bus-rabbitmq'

import { BusMemoryModule }                 from './bus-memory-module'
import { BusRabbitMQModule }               from './bus-rabbitmq-module'
import { Transport }                       from './enums'
import { BusModuleOptions }                from './interfaces'
import { busRabbitMQConfigurationFactory } from './factory'

@Module({})
export class BusModule {
  public static forRoot = (options: BusModuleOptions): DynamicModule => {
    switch (options.transport) {
      case Transport.Memory:
        return BusModule.forMemory()
      case Transport.RabbitMQ:
        return BusModule.forRabbitMQ(options.configuration)
      default:
        throw new Error('Unknown transport')
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
