import { INestApplication }     from '@nestjs/common'
import { Test }                 from '@nestjs/testing'

import { BusModule, Transport } from '../../src'

describe('BusModule', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BusModule.forRoot({
          transport: Transport.RabbitMQ,
          configuration: {
            queueName: 'any',
            connectionString: 'any',
          },
        }),
      ],
    }).compile()

    app = module.createNestApplication()
  })

  it('to be defined', () => {
    expect(app).toBeDefined()
  })
})
