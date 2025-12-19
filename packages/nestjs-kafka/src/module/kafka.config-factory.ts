import type { KafkaConfig }               from 'kafkajs'

import { Inject }                         from '@nestjs/common'
import { Injectable }                     from '@nestjs/common'

import { KAFKA_MODULE_OPTIONS_CLIENT_ID } from './kafka.module.constants.js'
import { KAFKA_MODULE_OPTIONS_BROKERS }   from './kafka.module.constants.js'

@Injectable()
export class KafkaConfigFactory {
  constructor(
    @Inject(KAFKA_MODULE_OPTIONS_CLIENT_ID)
    private readonly clientId: string,
    @Inject(KAFKA_MODULE_OPTIONS_BROKERS)
    private readonly brokers: Array<string>
  ) {}

  createKafkaOptions(): KafkaConfig {
    const fallbackBrokers = process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(',')
      : ['localhost:29092']

    return {
      clientId: this.clientId || process.env.KAFKA_CLIENT_ID,
      brokers: this.brokers.length > 0 ? this.brokers : fallbackBrokers,
    }
  }
}
