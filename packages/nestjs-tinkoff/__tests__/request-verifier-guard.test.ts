import { Test } from '@nestjs/testing'
import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import request from 'supertest';

import { RequestVerifierGuard, TinkoffAPIModule, TinkoffService } from '../src'

@Controller('/')
class SomeController {
  @Post('/some_path')
  @UseGuards(RequestVerifierGuard)
  @HttpCode(HttpStatus.OK)
  someMethod() {
    return {}
  }
}

describe('test', () => {
  let app: any
  const options = {
    password: 'ripazha',
    terminalKey: 'DEMO',
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TinkoffAPIModule.register(options)
      ],
      controllers: [SomeController],
    }).compile()

    app = module.createNestApplication()

    await app.init()
  })
  
  it('boo', async () => {
    const payload: any = {
      Token: '0384b0f144043de7d1aa848f0e38c494f7e5243efee1e2675fcaa5be534e6a91',
      RebillId: 1610360457462,
      ExpDate: '1122',
      Pan: '430000******0777',
      CardId: 32273381,
      Amount: 125000,
      ErrorCode: '0',
      PaymentId: 422409756,
      Status: 'CONFIRMED',
      Success: true,
      OrderId: '214',
      TerminalKey: options.terminalKey,
      Password: options.password,
    }

    return request(app.getHttpServer())
      .post('/some_path')
      .send(payload)
      .set('Accept', 'application/json')
      .expect(200)
  })

  afterAll(async () => {
    await app.close();
  });
})
