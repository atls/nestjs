import { BUS_SYMBOLS }                    from '@node-ts/bus-core'
import { MemoryQueue }                    from '@node-ts/bus-core/dist/transport'
import { RabbitMqTransportConfiguration } from '@node-ts/bus-rabbitmq'
import { RabbitMqTransport }              from '@node-ts/bus-rabbitmq/dist/rabbitmq-transport'
import { connect }                        from 'amqplib'

import { Logger }                         from '@atlantis-lab/nestjs-logger'
import { DynamicModule, Module }          from '@nestjs/common'

import { BusCoreModule }                  from './core'

@Module({})
export class BusModule {
  static forMemory(): DynamicModule {
    const transportProvider = {
      provide: BUS_SYMBOLS.Transport,
      useFactory: (logger: any) => new MemoryQueue(logger),
      inject: [Logger],
    }
    return {
      module: BusModule,
      imports: [BusCoreModule.forRoot(transportProvider)],
    }
  }

  static forRabbitMq(configuration: RabbitMqTransportConfiguration): DynamicModule {
    const connectionFactory = () => connect(configuration.connectionString)
    const transportProvider = {
      provide: BUS_SYMBOLS.Transport,
      useFactory: (logger: any) => new RabbitMqTransport(connectionFactory, configuration, logger),
      inject: [Logger],
    }
    return {
      module: BusModule,
      imports: [BusCoreModule.forRoot(transportProvider)],
    }
  }
}
