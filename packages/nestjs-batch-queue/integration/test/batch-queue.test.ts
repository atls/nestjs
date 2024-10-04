import type { INestApplication } from '@nestjs/common'

import { Test }                  from '@nestjs/testing'
import { describe }              from '@jest/globals'
import { it }                    from '@jest/globals'
import { expect }                from '@jest/globals'
import { beforeAll }             from '@jest/globals'
import { afterAll }              from '@jest/globals'

import { BatchQueueModule }      from '../../src/index.js'
import { BATCH_QUEUE_CONSUMER }  from '../../src/index.js'
import { BATCH_QUEUE_PRODUCER }  from '../../src/index.js'

describe('external renderer', () => {
  let app: INestApplication

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [
        BatchQueueModule.registerAsync({
          imports: [],
          useFactory: () => ({
            core: {
              maxQueueLength: 10_000,
              maxTotalQueueLength: 100_000,
              maxQueues: 20,
              timeoutDuration: 2_000,
            },
          }),
          inject: [],
        }),
      ],
    }).compile()

    app = testingModule.createNestApplication()

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('some', async () => {
    const consumer = app.get(BATCH_QUEUE_CONSUMER)
    consumer.consume(async (queueName, value) => {
      expect(queueName).toBe('test')
      expect(value).toEqual(['test']);
    })
    const producer = app.get(BATCH_QUEUE_PRODUCER)
    producer.produce('test', 'test')
    await new Promise((resolve) => setTimeout(resolve, 3000));
  })
})
