import { DynamicModule, Global, Inject, Module, OnModuleInit }  from '@nestjs/common'
import { BUS_SYMBOLS, Bus }                                     from '@node-ts/bus-core'
import { MemoryQueue }                                          from '@node-ts/bus-core/dist/transport'
import { BUS_RABBITMQ_SYMBOLS, RabbitMqTransportConfiguration } from '@node-ts/bus-rabbitmq'

import { Logger }                                               from '@atls/nestjs-logger'

import { BusCoreModule }                                        from './core'
import { RabbitMqTransport }                                    from './transport'
import { connect }                                              from './amqp'

@Module({})
export class BusModule {
  static forMemory(): DynamicModule {
    const transportProvider = {
      provide: BUS_SYMBOLS.Transport,
      useFactory: (logger) => new MemoryQueue(logger),
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
      useFactory: (logger) => new RabbitMqTransport(connectionFactory, configuration, logger),
      inject: [Logger],
    }

    return {
      module: BusModule,
      imports: [BusCoreModule.forRoot(transportProvider)],
    }
  }
}
