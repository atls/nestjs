import 'reflect-metadata'

import { INestApplication } from '@nestjs/common'
import { Test }             from '@nestjs/testing'

// @ts-ignore
import { LoggerModule }     from '@atls/nestjs-logger'

import { BusModule }        from '../module'

describe('bus module', () => {
  let module: any
  let app: INestApplication

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(), BusModule.forMemory()],
    }).compile()

    app = module.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('check', async () => {
    expect(true).toBe(true)
  })
})
