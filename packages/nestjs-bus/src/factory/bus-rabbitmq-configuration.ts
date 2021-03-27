import { Provider }                       from '@nestjs/common'
import { RabbitMqTransportConfiguration } from '@node-ts/bus-rabbitmq'

import { BUS_RABBITMQ_CONFIGURATION }     from '../symbols'

export const busRabbitMQConfigurationFactory = (
  configuration: RabbitMqTransportConfiguration,
): Provider<RabbitMqTransportConfiguration> => ({
  provide: BUS_RABBITMQ_CONFIGURATION,
  useValue: configuration,
})
