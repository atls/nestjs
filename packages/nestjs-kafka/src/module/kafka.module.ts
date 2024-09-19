import type { DynamicModule }             from '@nestjs/common'
import type { KafkaConfig }               from 'kafkajs'

import { Module }                         from '@nestjs/common'

import { KAFKA_MODULE_OPTIONS_CLIENT_ID } from './kafka.module.constants.js'
import { KAFKA_MODULE_OPTIONS_BROKERS }   from './kafka.module.constants.js'
import { KafkaConfigFactory }             from './kafka.config-factory.js'
import { KafkaFactory }                   from './kafka.factory.js'

@Module({})
export class KafkaModule {
  static register(options: Partial<KafkaConfig> = {}): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        KafkaConfigFactory,
        KafkaFactory,
        {
          provide: KAFKA_MODULE_OPTIONS_BROKERS,
          useValue: options.brokers,
        },
        {
          provide: KAFKA_MODULE_OPTIONS_CLIENT_ID,
          useValue: options.clientId,
        },
      ],
      exports: [KafkaConfigFactory, KafkaFactory],
    }
  }
}
