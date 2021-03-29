import { RabbitMqTransportConfiguration } from '@node-ts/bus-rabbitmq'

import { Transport }                      from '../enums'

export interface RabbitMQBusModuleOptions {
  readonly transport: Transport.RabbitMQ
  readonly configuration: RabbitMqTransportConfiguration
}

export interface MemoryBusModuleOptions {
  readonly transport: Transport.Memory
}

export type BusModuleOptions = RabbitMQBusModuleOptions | MemoryBusModuleOptions
