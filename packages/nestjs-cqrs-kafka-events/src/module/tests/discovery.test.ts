import assert                    from 'node:assert/strict'
import { test }                  from 'node:test'

import { CqrsModule }            from '@nestjs/cqrs'
import { Test }                  from '@nestjs/testing'

import { Kafka }                 from '@atls/nestjs-kafka'

import { CqrsKafkaEventsModule } from '../cqrs-kafka-events.module.js'
import { Received }              from './event.js'
import { Handler }               from './handler.js'
for (const asynchronous of [false, true]) {
  test(`discovers event subscriptions with public CQRS module and ${asynchronous ? 'asynchronous' : 'synchronous'} registration`, async () => {
    const topics: Array<string> = []
    let receive:
      ((data: { topic: string; message: { value: Buffer } }) => Promise<void>) | undefined
    const kafka = {
      producer: () => ({ connect: async () => undefined, disconnect: async () => undefined }),
      consumer: () => ({
        connect: async () => undefined,
        disconnect: async () => undefined,
        subscribe: async ({ topic }: { topic: string }) => {
          topics.push(topic)
        },
        run: async ({ eachMessage }: { eachMessage: typeof receive }) => {
          receive = eachMessage
        },
      }),
    }
    const application = await Test.createTestingModule({
      imports: [
        CqrsModule.forRoot(),
        asynchronous
          ? CqrsKafkaEventsModule.registerAsync({
              useFactory: () => ({ clientId: 'test', brokers: [] }),
            })
          : CqrsKafkaEventsModule.register({ clientId: 'test', brokers: [] }),
      ],
      providers: [Handler],
    })
      .overrideProvider(Kafka)
      .useValue(kafka)
      .compile()
    try {
      await application.init()
      assert.deepEqual(topics, [Received.name])
      assert.ok(receive)
      await receive({ topic: Received.name, message: { value: Buffer.from('{}') } })
      await new Promise<void>((resolve) => {
        setImmediate(resolve)
      })
      assert.equal(application.get(Handler).received, true)
    } finally {
      await application.close()
    }
  })
}
