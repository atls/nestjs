import { Controller }         from '@nestjs/common'
import { UsePipes }           from '@nestjs/common'
import { GrpcMethod }         from '@nestjs/microservices'

import { GrpcValidationPipe } from '../../src'
import { TestDto }            from './test.dto'

@Controller()
export class TestController {
  @GrpcMethod('TestService', 'TestValidation')
  @UsePipes(new GrpcValidationPipe())
  test({ id }: TestDto) {
    return {
      id,
    }
  }
}
