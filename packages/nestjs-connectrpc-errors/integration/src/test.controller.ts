import type { ExecTestRequest }       from '../gen/interfaces/test_pb.js'
import type { ExecTestResponse }      from '../gen/interfaces/test_pb.js'

import { ServiceImpl }                from '@connectrpc/connect'
import { Controller }                 from '@nestjs/common'
import { UseFilters }                 from '@nestjs/common'

import { ConnectRpcMethod }           from '@atls/nestjs-connectrpc'
import { ConnectRpcService }          from '@atls/nestjs-connectrpc'
import { Validator }                  from '@atls/nestjs-validation'

import { ConnectRpcExceptionsFilter } from '../../src/index.js'
import { TestService }                from '../gen/test_connect.js'
import { TestPayload }                from './test.payload.js'

@Controller()
@ConnectRpcService(TestService)
@UseFilters(ConnectRpcExceptionsFilter)
export class TestController implements ServiceImpl<typeof TestService> {
  constructor(private readonly validator: Validator) {}

  @ConnectRpcMethod()
  async testValidation(request: ExecTestRequest): Promise<ExecTestResponse> {
    const payload: TestPayload = await this.validator.validate(request, TestPayload)

    return {
      id: payload.id,
    }
  }
}
