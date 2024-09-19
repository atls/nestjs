import type { KafkaConfig }   from 'kafkajs'

import { Injectable }         from '@nestjs/common'
import { Kafka }              from 'kafkajs'

import { KafkaConfigFactory } from './kafka.config-factory.js'
import { kafkaLogCreator }    from '../logger/index.js'

@Injectable()
export class KafkaFactory {
  constructor(private readonly configFactory: KafkaConfigFactory) {}

  create(options: Partial<KafkaConfig> = {}): Kafka {
    return new Kafka({
      logCreator: kafkaLogCreator,
      ...this.configFactory.createKafkaOptions(),
      ...options,
    })
  }
}
