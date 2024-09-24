// @ts-nocheck
import { Controller }       from '@nestjs/common'
import { GrpcMethod }       from '@nestjs/microservices'
import { GrpcStreamMethod } from '@nestjs/microservices'
import { RpcException }     from '@nestjs/microservices'
import { Subject }          from 'rxjs'

@Controller()
export class TestController {
  @GrpcMethod('TestService', 'Test')
  test(input: { id: string }): { id: string } {
    return {
      id: input.id,
    }
  }

  @GrpcMethod('TestService', 'TestError')
  testError(input: { id: string }): void {
    throw new RpcException(new Error(input.id))
  }

  @GrpcStreamMethod('TestService', 'TestStream')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  testStream(request) {
    const response = new Subject()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    request.subscribe({
      complete: () => {
        response.complete()
      },
      next: ({ id }) => {
        response.next({
          id,
        })
      },
    })

    return response.asObservable()
  }

  @GrpcMethod('TestService', 'TestAuth')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  auth(_, metadata): { id: string } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const authorization = metadata.get('authorization')?.[0]

    return {
      id: authorization,
    }
  }
}
