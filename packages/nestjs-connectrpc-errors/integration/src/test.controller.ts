import { UseFilters }                 from '@nestjs/common'

import { ConnectRpcMethod }           from '@atls/nestjs-connectrpc'
import { ConnectRpcService }          from '@atls/nestjs-connectrpc'
import { Validator }                  from '@atls/nestjs-validation'

import { ConnectRpcExceptionsFilter } from '../../src/index.js'
import { TestService }                from '../gen/test_connect.js'
import { TestPayload }                from './test.payload.js'

@ConnectRpcService(TestService)
@UseFilters(ConnectRpcExceptionsFilter)
export class TestController {
  constructor(private readonly validator: Validator) {}

  @ConnectRpcMethod()
  async testValidation(request: { id: string }): Promise<{ id: string }> {
    const payload: TestPayload = await this.validator.validate(request, TestPayload)

    return {
      id: payload.id,
    }
  }
}
