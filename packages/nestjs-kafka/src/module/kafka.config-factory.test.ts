import assert                 from 'node:assert/strict'
import { it }                 from 'node:test'

import { KafkaConfigFactory } from './kafka.config-factory.js'

it('uses fallback brokers when the module registers without options', () => {
  const previousBrokers = process.env.KAFKA_BROKERS
  delete process.env.KAFKA_BROKERS

  try {
    const config = new KafkaConfigFactory('test-client', undefined).createKafkaOptions()

    assert.equal(config.clientId, 'test-client')
    assert.deepEqual(config.brokers, ['localhost:29092'])
  } finally {
    if (previousBrokers === undefined) delete process.env.KAFKA_BROKERS
    else process.env.KAFKA_BROKERS = previousBrokers
  }
})

it('keeps explicitly configured brokers', () => {
  const config = new KafkaConfigFactory('test-client', ['broker:9092']).createKafkaOptions()

  assert.deepEqual(config.brokers, ['broker:9092'])
})
