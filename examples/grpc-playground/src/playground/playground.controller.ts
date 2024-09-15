// @ts-nocheck
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

@Controller()
export class PlaygroundController {
  @GrpcMethod('PlaygroundService', 'Echo')
  echo(request) {
    return {
      pong: request.ping,
    }
  }

  @GrpcMethod('PlaygroundService', 'Switch')
  switch(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'Text')
  text(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'Number')
  number(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'Enum')
  enum(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'Nested')
  nested(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'Repeated')
  repeated(request) {
    return request
  }

  @GrpcMethod('PlaygroundService', 'KitchenSink')
  kitchenSink(request) {
    return request
  }
}
