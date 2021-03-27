import { Module, DynamicModule } from '@nestjs/common'
import { BusRabbitMqModule, BUS_RABBITMQ_SYMBOLS, RabbitMqTransportConfiguration } from '@node-ts/bus-rabbitmq'
import { BusModule as NodeTSBusModule } from '@node-ts/bus-core'
import { BusModuleOptions } from './interfaces'
import { BusRabbitMQModule } from './bus-rabbitmq-module'
import { BusMemoryModule } from './bus-memory-module'
import { busRabbitMQConfigurationFactory } from './factory'
import { BUS_RABBITMQ_CONFIGURATION } from './symbols'
import { Transport } from './enums'

@Module({
  providers: [],
})
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
